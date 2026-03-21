# Diabetes Risk Screening App

I built this to predict diabetes risk from basic health metrics. Probably the most feature-complete project I've done—Flask API, React UI, trained model, tests, CI, and documentation.

## What's here
- Backend API in Flask that makes predictions
- React frontend so you can actually use it
- Scikit-learn model that I trained
- Pytest tests (actually passes all 7 of them)
- GitHub Actions workflow to catch breakage before I ship

## Tech Stack
- Backend: Flask, scikit-learn, pandas, joblib
- Frontend: React, Vite, Tailwind CSS, Axios, Recharts
- Testing: pytest, Flask test client
- CI: GitHub Actions

## Features
- Diabetes risk prediction API (`POST /predict`)
- Health endpoint (`GET /health`)
- Input validation and structured error responses
- Basic per-client rate limiting for inference endpoint
- Configurable CORS and runtime settings via environment variables
- Detailed frontend risk card and downloadable report
- Model metrics artifact (`backend/model_metrics.json`)

## Project Structure

```text
AI Medical Diagnosis Assistant/
|-- app.py
|-- requirements.txt
|-- pytest.ini
|-- .env.example
|-- start.bat / start.sh
|-- .devcontainer/
|   |-- devcontainer.json
|-- backend/
|   |-- dataset.csv
|   |-- train_model.py
|   |-- model.pkl
|   |-- features.pkl
|   |-- model_metrics.json
|-- frontend/
|   |-- package.json
|   |-- .env.example
|   |-- src/
|-- tests/
|   |-- test_app.py
|   |-- test_integration_api.py
|-- .github/workflows/ci.yml
```

## Quick Start (easiest way)

### Option 1: GitHub Codespaces (no setup needed)
Click this button, wait 2 minutes, then run one command:

```bash
# In the Codespaces terminal (project root):
bash start.sh
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

### Option 2: Run script on your machine
- **Windows:** Double-click `start.bat`
- **Mac/Linux:** `bash start.sh`

Sets up and runs both servers automatically.

## Local Setup

### Manual setup (skip if using script or Codespaces)


### 1. Backend

```powershell
cd "C:\Users\HP\OneDrive\Desktop\AI Medical Diagnosis Assistant"
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```powershell
cd "C:\Users\HP\OneDrive\Desktop\AI Medical Diagnosis Assistant\frontend"
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment Variables

### Backend (`.env.example`)
- `FLASK_HOST`
- `FLASK_PORT`
- `FLASK_DEBUG`
- `LOG_LEVEL`
- `CORS_ORIGINS`
- `MAX_REQUESTS_PER_MINUTE`

### Frontend (`frontend/.env.example`)
- `VITE_API_BASE_URL`

## Train and Evaluate the Model

```powershell
cd "C:\Users\HP\OneDrive\Desktop\AI Medical Diagnosis Assistant"
.\.venv\Scripts\Activate.ps1
python backend/train_model.py
```

Outputs:
- `backend/model.pkl`
- `backend/features.pkl`
- `backend/model_metrics.json`

## Run Tests

```powershell
cd "C:\Users\HP\OneDrive\Desktop\AI Medical Diagnosis Assistant"
.\.venv\Scripts\Activate.ps1
pytest
```

Should pass all 7. If not, something's broken.

## API Contract

### `POST /predict`
Request body example:

```json
{
  "Pregnancies": 2,
  "Glucose": 120,
  "BloodPressure": 70,
  "SkinThickness": 20,
  "Insulin": 85,
  "BMI": 30.5,
  "DiabetesPedigreeFunction": 0.5,
  "Age": 35
}
```

Response example:

```json
{
  "prediction": "Diabetes",
  "diabetes_probability": 0.82,
  "no_diabetes_probability": 0.18,
  "risk_percentage": 82.0,
  "risk_level": "Very High",
  "model_metadata": {
    "model_type": "Pipeline",
    "feature_count": 8,
    "sklearn_version": "1.7.2"
  }
}
```

## Deployment Plan

### Backend on Render
1. Open Render and create a new Blueprint deployment.
2. Connect this GitHub repository.
3. Render will detect `render.yaml` automatically.
4. Deploy and copy the backend URL (for example `https://diabetes-risk-api.onrender.com`).

Health check endpoint:

```text
https://<your-render-url>/health
```

### Frontend on Vercel
1. Import the `frontend` directory as a Vercel project.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable `VITE_API_BASE_URL` with your Render backend URL.
6. Deploy.

The `frontend/vercel.json` file is already set for SPA route rewrites.

## Interview Talking Points
- Built the whole thing from scratch: model training, REST API, React UI, all wired together and working
- Tests aren't just for show—7 passing pytest tests + CI that actually runs them
- Made the API handle edge cases properly: validation, rate limiting, structured errors
- Tracked model performance (accuracy, precision, recall, F1, AUC) so I actually know what's working

## Important Disclaimer
This project is an educational decision-support prototype. It is not a medical diagnostic device and must not replace clinical judgment.
