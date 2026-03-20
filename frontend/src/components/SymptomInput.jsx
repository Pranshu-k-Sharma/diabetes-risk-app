import { useState } from "react";

function SymptomInput({ onPredict, loading }) {
  const [symptomText, setSymptomText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const symptoms = symptomText
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (symptoms.length === 0) {
      return;
    }

    onPredict(symptoms);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Enter symptoms (comma separated)
      </label>
      <textarea
        rows={4}
        value={symptomText}
        onChange={(event) => setSymptomText(event.target.value)}
        placeholder="Example: fever, cough, headache"
        className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Predicting..." : "Predict Disease"}
      </button>
    </form>
  );
}

export default SymptomInput;
