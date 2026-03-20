import app as api


def test_predict_integration_schema():
    if api.STARTUP_ERROR:
        raise AssertionError(f"Model failed to load in integration test: {api.STARTUP_ERROR}")

    with api.app.test_client() as client:
        response = client.post(
            "/predict",
            json={
                "Pregnancies": 3,
                "Glucose": 130,
                "BloodPressure": 72,
                "SkinThickness": 20,
                "Insulin": 90,
                "BMI": 31.2,
                "DiabetesPedigreeFunction": 0.45,
                "Age": 38,
            },
        )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["prediction"] in {"Diabetes", "No Diabetes"}
    assert 0 <= payload["risk_percentage"] <= 100
    assert payload["risk_level"] in {"Low", "Moderate", "High", "Very High"}
