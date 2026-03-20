import DiabetesReport from "./DiabetesReport";

const markerRanges = {
  Glucose: { min: 70, max: 99, label: "Fasting glucose" },
  BloodPressure: { min: 60, max: 80, label: "Diastolic BP" },
  BMI: { min: 18.5, max: 24.9, label: "BMI" },
  Insulin: { min: 16, max: 166, label: "2-hour insulin" },
};

function getMarkerStatus(value, min, max) {
  if (value < min) {
    return "Low";
  }
  if (value > max) {
    return "High";
  }
  return "Within Range";
}

function DiabetesResultCard({ result, patientData }) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-slate-600">
        Prediction result will appear here.
      </div>
    );
  }

  const isHighRisk = result.prediction === "Diabetes";
  const riskPercentage = Number(result.risk_percentage ?? 0);
  const noRiskPercentage = Math.max(0, 100 - riskPercentage);

  const riskColorClass =
    result.risk_level === "Very High" || result.risk_level === "High"
      ? "text-red-700"
      : result.risk_level === "Moderate"
      ? "text-amber-700"
      : "text-green-700";

  return (
    <div
      className={`rounded-2xl border p-6 shadow-md ${
        isHighRisk
          ? "border-red-200 bg-red-50"
          : "border-green-200 bg-green-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Clinical Risk Summary</h2>
          <p className={`mt-3 text-2xl font-bold ${
            isHighRisk ? "text-red-700" : "text-green-700"
          }`}>
            {result.prediction}
          </p>
          <p className={`mt-1 text-sm font-semibold ${riskColorClass}`}>
            Risk Level: {result.risk_level || "N/A"}
          </p>
        </div>
        <div className={`rounded-full p-3 ${
          isHighRisk ? "bg-red-100" : "bg-green-100"
        }`}>
          <span className={`text-2xl ${isHighRisk ? "text-red-700" : "text-green-700"}`}>
            {isHighRisk ? "!" : "OK"}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Diabetes probability</span>
          <span>{riskPercentage.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-3 rounded-full transition-all ${
              riskPercentage >= 50 ? "bg-red-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, riskPercentage))}%` }}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diabetes</p>
          <p className="mt-1 text-lg font-bold text-red-700">{riskPercentage.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg bg-white/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">No Diabetes</p>
          <p className="mt-1 text-lg font-bold text-green-700">{noRiskPercentage.toFixed(1)}%</p>
        </div>
      </div>

      {patientData && (
        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <h3 className="text-sm font-bold text-slate-800">Clinical Marker Review</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(markerRanges).map(([key, meta]) => {
              const rawValue = Number(patientData[key]);
              const status = getMarkerStatus(rawValue, meta.min, meta.max);
              const statusClass =
                status === "Within Range"
                  ? "text-green-700 bg-green-100"
                  : "text-red-700 bg-red-100";

              return (
                <div key={key} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-500">{meta.label}</p>
                  <p className="mt-1 text-base font-bold text-slate-800">{rawValue}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ref: {meta.min} - {meta.max}
                  </p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-opacity-20 pt-4">
        <p className={`text-sm font-semibold ${
          isHighRisk ? "text-red-700" : "text-green-700"
        }`}>
          {isHighRisk
            ? "Model indicates elevated diabetes risk. Recommend confirmatory lab evaluation (for example fasting plasma glucose, HbA1c, or OGTT)."
            : "Model indicates lower current diabetes risk. Continue routine preventive screening and lifestyle management."}
        </p>
      </div>

      <div className="mt-4 rounded-lg bg-white/50 p-3 text-xs text-slate-600">
        ⓘ <strong>Important:</strong> This is just a model prediction, not a real diagnosis. You should talk to a doctor before making any decisions based on this.
      </div>

      {result.model_metadata && (
        <div className="mt-3 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
          <p>
            <strong>Model:</strong> {result.model_metadata.model_type}
          </p>
          <p>
            <strong>Features:</strong> {result.model_metadata.feature_count}
          </p>
          <p>
            <strong>Scikit-learn:</strong> {result.model_metadata.sklearn_version}
          </p>
        </div>
      )}

      <DiabetesReport result={result} inputData={patientData} />
    </div>
  );
}

export default DiabetesResultCard;
