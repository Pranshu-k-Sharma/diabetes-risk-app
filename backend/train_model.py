from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    dataset_path = base_dir / "dataset.csv"

    data = pd.read_csv(dataset_path)

    X = data.drop(columns=["Outcome"])
    y = data["Outcome"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = make_pipeline(
        StandardScaler(),
        RandomForestClassifier(random_state=42),
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_proba)), 4),
        "train_size": int(X_train.shape[0]),
        "test_size": int(X_test.shape[0]),
        "feature_count": int(X.shape[1]),
        "class_distribution": {
            "negative": int((y == 0).sum()),
            "positive": int((y == 1).sum()),
        },
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(
            y_test,
            y_pred,
            target_names=["No Diabetes", "Diabetes"],
            zero_division=0,
        ),
    }

    print("Evaluation Metrics")
    print(json.dumps({k: v for k, v in metrics.items() if k != "classification_report"}, indent=2))
    print("\nClassification Report")
    print(metrics["classification_report"])

    joblib.dump(model, base_dir / "model.pkl")
    joblib.dump(X.columns.tolist(), base_dir / "features.pkl")
    with (base_dir / "model_metrics.json").open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("Saved model.pkl and features.pkl")
    print("Saved model_metrics.json")


if __name__ == "__main__":
    main()
