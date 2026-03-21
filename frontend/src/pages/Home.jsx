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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rise-in rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-10">
        <div>
          <p className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            Clinical Decision Support Prototype
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Diabetes Risk Intelligence Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Submit patient health markers and get an interpretable risk estimate with probability breakdown,
            marker context, and export-ready summary.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/80 bg-white/85 p-3 text-sm font-semibold text-slate-700">
            Probability + risk bands
          </div>
          <div className="rounded-xl border border-white/80 bg-white/85 p-3 text-sm font-semibold text-slate-700">
            Clinical marker review
          </div>
          <div className="rounded-xl border border-white/80 bg-white/85 p-3 text-sm font-semibold text-slate-700">
            PDF-ready detailed report
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5">
        <div className="glass-panel rise-in stagger-1 rounded-[1.6rem] p-4 sm:p-6">
          <DiabetesPredictionForm onPredict={handlePredict} loading={loading} />
        </div>

        {error && (
          <div className="rise-in stagger-2 rounded-2xl border border-rose-200 bg-rose-50/95 p-4 text-sm font-semibold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="rise-in stagger-2">
          <DiabetesResultCard result={result} patientData={lastInput} />
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-slate-500">
        This tool supports screening conversations and does not replace clinical diagnosis.
      </p>
    </main>
  );
}

export default Home;
