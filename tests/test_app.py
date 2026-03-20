import importlib

import pytest

import app as api


class DummyModel:
    def predict(self, df):
        return [1]

    def predict_proba(self, df):
        return [[0.2, 0.8]]


@pytest.fixture
def client(monkeypatch):
    importlib.reload(api)
    monkeypatch.setattr(api, "MODEL", DummyModel())
    monkeypatch.setattr(
        api,
        "FEATURE_ORDER",
        [
            "Pregnancies",
            "Glucose",
            "BloodPressure",
            "SkinThickness",
            "Insulin",
            "BMI",
            "DiabetesPedigreeFunction",
            "Age",
        ],
    )
    monkeypatch.setattr(api, "STARTUP_ERROR", None)
    monkeypatch.setattr(api, "MAX_REQUESTS_PER_MINUTE", 60)
    with api.app.test_client() as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["status"] == "ok"


def test_predict_requires_json(client):
    response = client.post("/predict", data="plain text")
    assert response.status_code == 400
    assert "Request must be JSON" in response.get_json()["error"]


def test_predict_missing_required_field(client):
    response = client.post(
        "/predict",
        json={
            "Pregnancies": 1,
            "Glucose": 100,
            "BloodPressure": 70,
            "SkinThickness": 20,
            "Insulin": 85,
            "BMI": 25,
            "DiabetesPedigreeFunction": 0.5,
        },
    )
    assert response.status_code == 400
    assert "Missing required fields" in response.get_json()["error"]


def test_predict_rejects_non_numeric(client):
    response = client.post(
        "/predict",
        json={
            "Pregnancies": 1,
            "Glucose": "abc",
            "BloodPressure": 70,
            "SkinThickness": 20,
            "Insulin": 85,
            "BMI": 25,
            "DiabetesPedigreeFunction": 0.5,
            "Age": 34,
        },
    )
    assert response.status_code == 400
    assert "must be a number" in response.get_json()["error"]


def test_predict_response_schema(client):
    response = client.post(
        "/predict",
        json={
            "Pregnancies": 2,
            "Glucose": 140,
            "BloodPressure": 78,
            "SkinThickness": 24,
            "Insulin": 96,
            "BMI": 29.1,
            "DiabetesPedigreeFunction": 0.48,
            "Age": 40,
        },
    )
    assert response.status_code == 200
    payload = response.get_json()

    expected_keys = {
        "prediction",
        "diabetes_probability",
        "no_diabetes_probability",
        "risk_percentage",
        "risk_level",
        "model_metadata",
    }
    assert expected_keys.issubset(payload.keys())
    assert payload["model_metadata"]["feature_count"] == 8


def test_predict_rate_limited(client, monkeypatch):
    monkeypatch.setattr(api, "MAX_REQUESTS_PER_MINUTE", 1)
    body = {
        "Pregnancies": 2,
        "Glucose": 140,
        "BloodPressure": 78,
        "SkinThickness": 24,
        "Insulin": 96,
        "BMI": 29.1,
        "DiabetesPedigreeFunction": 0.48,
        "Age": 40,
    }

    first = client.post("/predict", json=body)
    second = client.post("/predict", json=body)

    assert first.status_code == 200
    assert second.status_code == 429
