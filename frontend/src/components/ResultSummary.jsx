function ResultSummary({ disease, confidence, precautions, selectedSymptoms }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-teal-100 bg-white p-5">
        <h2 className="text-xl font-bold text-slate-800">Diagnosis Result</h2>
        <p className="mt-3 text-slate-700">
          Disease: <span className="font-semibold text-primary">{disease}</span>
        </p>
        <p className="text-slate-700">
          Confidence: <span className="font-semibold text-accent">{confidence}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-800">Precautions</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-700">
          {precautions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-800">Selected Symptoms</h3>
        <p className="mt-2 text-slate-700">
          {selectedSymptoms.length > 0
            ? selectedSymptoms.map((item) => item.replaceAll("_", " ")).join(", ")
            : "No symptoms were selected."}
        </p>
      </div>
    </div>
  );
}

export default ResultSummary;
