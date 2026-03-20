function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-slate-600">
        Prediction result will appear here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Prediction Result</h2>
      <p className="mt-2 text-slate-700">
        Disease: <span className="font-semibold text-primary">{result.disease}</span>
      </p>
      <p className="text-slate-700">
        Confidence: <span className="font-semibold text-accent">{result.confidence}</span>
      </p>
      {result.unknown_symptoms && result.unknown_symptoms.length > 0 && (
        <p className="mt-2 text-sm text-amber-700">
          Unknown symptoms: {result.unknown_symptoms.join(", ")}
        </p>
      )}
    </div>
  );
}

export default ResultCard;
