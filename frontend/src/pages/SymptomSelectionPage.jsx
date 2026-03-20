import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import SymptomChecklist from "../components/SymptomChecklist";
import symptoms from "../data/symptoms";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function SymptomSelectionPage() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Send selected symptoms array to Flask backend.
      const response = await axios.post(`${API_BASE_URL}/predict`, {
        symptoms: selectedSymptoms,
      }, {
        timeout: 15000,
      });

      if (!response?.data?.disease || !response?.data?.confidence) {
        throw new Error("Invalid response from server.");
      }

      navigate("/result", {
        state: {
          result: response.data,
          selectedSymptoms,
        },
      });
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Could not get prediction from server.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
        Symptom Selection
      </h1>
      <p className="mt-2 text-slate-600">
        Select all symptoms that apply, then submit to get diagnosis prediction.
      </p>

      <div className="mt-6">
        <SymptomChecklist
          items={symptoms}
          selected={selectedSymptoms}
          onToggle={handleToggleSymptom}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/")}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          )}
          {loading ? "Predicting..." : "Submit Symptoms"}
        </button>
      </div>
    </PageShell>
  );
}

export default SymptomSelectionPage;
