import { useState } from "react";
import axios from "axios";
import DiabetesPredictionForm from "../components/DiabetesPredictionForm";
import DiabetesResultCard from "../components/DiabetesResultCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastInput, setLastInput] = useState(null);

  const handlePredict = async (patientData) => {
    setLoading(true);
    setError("");
    setLastInput(patientData);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, patientData, {
        timeout: 15000,
      });
      setResult(response.data);
    } catch (err) {
      let message = err.response?.data?.error || "Failed to fetch prediction.";
      if (err.code === "ECONNABORTED") {
        message = "Prediction timed out. Please try again.";
      } else if (!err.response) {
        message = "Cannot connect to backend API. Check that backend is running on port 5000.";
      }
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
          AI Diabetes Risk Prediction
        </h1>
        <p className="mt-2 text-slate-600">
          Enter your health numbers and get a risk estimate. Shows you the prediction plus confidence.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          API endpoint: {API_BASE_URL}
        </p>

        <div className="mt-6 grid gap-5">
          <DiabetesPredictionForm onPredict={handlePredict} loading={loading} />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DiabetesResultCard result={result} patientData={lastInput} />
        </div>
      </div>
    </main>
  );
}

export default Home;
