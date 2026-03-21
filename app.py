"""Flask API for diabetes prediction using a trained ML model."""

import logging
import os
import time
from collections import defaultdict, deque
from pathlib import Path
from threading import Lock

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn import __version__ as sklearn_version


app = Flask(__name__)

cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    CORS(app)  # Allow frontend clients hosted on different origins.
else:
    CORS(app, origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()])

logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("diabetes-api")

MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "60"))
_request_times = defaultdict(deque)
_request_lock = Lock()


def resolve_artifact_path(filename: str) -> Path:
    """Resolve model artifacts from backend/ first, then project root."""
    app_dir = Path(__file__).resolve().parent
    candidates = [
        app_dir / "backend" / filename,
        app_dir / filename,
    ]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError(f"Artifact '{filename}' not found in backend/ or project root.")


def load_artifacts():
    """Load the trained model and feature list used during training."""
    model_path = resolve_artifact_path("model.pkl")
    features_path = resolve_artifact_path("features.pkl")

    model = joblib.load(model_path)
    features = joblib.load(features_path)

    if not isinstance(features, list) or not all(isinstance(f, str) for f in features):
        raise ValueError("features.pkl must contain a list of feature names.")

    return model, features


def get_client_identifier() -> str:
    """Resolve a client identifier for lightweight per-minute rate limiting."""
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.remote_addr or "unknown"


def is_rate_limited(client_id: str, limit: int, period_seconds: int = 60) -> bool:
    """Return True if client exceeded limit in rolling period_seconds window."""
    now = time.time()
    window_start = now - period_seconds
    with _request_lock:
        events = _request_times[client_id]
        while events and events[0] < window_start:
            events.popleft()
        if len(events) >= limit:
            return True
        events.append(now)
    return False


try:
    MODEL, FEATURE_ORDER = load_artifacts()
    STARTUP_ERROR = None
except Exception as exc:
    MODEL = None
    FEATURE_ORDER = []
    STARTUP_ERROR = str(exc)


def validate_and_build_dataframe(payload: dict) -> pd.DataFrame:
    """Validate incoming JSON and build a single-row dataframe in trained feature order."""
    missing_features = [feature for feature in FEATURE_ORDER if feature not in payload]
    if missing_features:
        raise ValueError(f"Missing required fields: {', '.join(missing_features)}")

    # Keep only expected features and enforce numeric values.
    row = {}
    for feature in FEATURE_ORDER:
        value = payload[feature]
        try:
            row[feature] = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Field '{feature}' must be a number.") from exc

    # Build dataframe and keep exact training order before prediction.
    input_df = pd.DataFrame([row])
    input_df = input_df[FEATURE_ORDER]
    return input_df


def get_risk_level(probability: float) -> str:
    """Map model probability to a simple clinical-style risk band."""
    if probability < 0.2:
        return "Low"
    if probability < 0.5:
        return "Moderate"
    if probability < 0.8:
        return "High"
    return "Very High"


@app.route("/", methods=["GET", "HEAD"])
def index():
    """Landing route so hosted API root is visibly healthy."""
    return (
        jsonify(
            {
                "service": "Diabetes Risk API",
                "status": "ok",
                "endpoints": {
                    "health": "/health",
                    "predict": "/predict",
                },
            }
        ),
        200,
    )


@app.route("/predict", methods=["POST"])
def predict():
    """Predict diabetes from patient health metrics."""
    if STARTUP_ERROR:
        return (
            jsonify(
                {
                    "error": "Model is not available.",
                    "details": STARTUP_ERROR,
                }
            ),
            500,
        )

    client_id = get_client_identifier()
    if is_rate_limited(client_id, MAX_REQUESTS_PER_MINUTE):
        return (
            jsonify(
                {
                    "error": "Rate limit exceeded.",
                    "details": f"Try again in a minute. Max {MAX_REQUESTS_PER_MINUTE} requests/minute.",
                }
            ),
            429,
        )

    if not request.is_json:
        return jsonify({"error": "Request must be JSON."}), 400

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid JSON payload."}), 400

    try:
        input_df = validate_and_build_dataframe(payload)
        raw_prediction = MODEL.predict(input_df)[0]

        # Probability is preferred for scientific reporting when available.
        diabetes_probability = None
        no_diabetes_probability = None
        if hasattr(MODEL, "predict_proba"):
            probabilities = MODEL.predict_proba(input_df)[0]
            no_diabetes_probability = float(probabilities[0])
            diabetes_probability = float(probabilities[1])
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": "Prediction failed.", "details": str(exc)}), 500

    prediction = "Diabetes" if int(raw_prediction) == 1 else "No Diabetes"

    if diabetes_probability is None:
        diabetes_probability = 1.0 if prediction == "Diabetes" else 0.0
    if no_diabetes_probability is None:
        no_diabetes_probability = 1.0 - diabetes_probability

    response = {
        "prediction": prediction,
        "diabetes_probability": round(diabetes_probability, 4),
        "no_diabetes_probability": round(no_diabetes_probability, 4),
        "risk_percentage": round(diabetes_probability * 100, 1),
        "risk_level": get_risk_level(diabetes_probability),
        "model_metadata": {
            "model_type": MODEL.__class__.__name__,
            "feature_count": len(FEATURE_ORDER),
            "sklearn_version": sklearn_version,
        },
    }
    return jsonify(response), 200


@app.route("/health", methods=["GET"])
def health():
    """Simple health endpoint to verify API and model availability."""
    if STARTUP_ERROR:
        return jsonify({"status": "error", "details": STARTUP_ERROR}), 500
    return jsonify({"status": "ok"}), 200


@app.before_request
def log_request_start():
    request._start_time = time.time()


@app.after_request
def log_request_end(response):
    elapsed_ms = None
    if hasattr(request, "_start_time"):
        elapsed_ms = round((time.time() - request._start_time) * 1000, 2)

    logger.info(
        "%s %s %s %sms",
        request.method,
        request.path,
        response.status_code,
        elapsed_ms if elapsed_ms is not None else "n/a",
    )
    return response


if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host=host, port=port, debug=debug)
