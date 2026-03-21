import { useState } from "react";

function DiabetesPredictionForm({ onPredict, loading }) {
  const [formData, setFormData] = useState({
    Sex: "",
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  });

  const [errors, setErrors] = useState({});

  const presets = {
    baselineAdult: {
      Sex: "female",
      Pregnancies: "1",
      Glucose: "92",
      BloodPressure: "72",
      SkinThickness: "22",
      Insulin: "88",
      BMI: "24.2",
      DiabetesPedigreeFunction: "0.27",
      Age: "31",
    },
    prediabetesPattern: {
      Sex: "female",
      Pregnancies: "2",
      Glucose: "122",
      BloodPressure: "78",
      SkinThickness: "28",
      Insulin: "126",
      BMI: "29.4",
      DiabetesPedigreeFunction: "0.51",
      Age: "42",
    },
    highRiskPattern: {
      Sex: "female",
      Pregnancies: "6",
      Glucose: "168",
      BloodPressure: "92",
      SkinThickness: "36",
      Insulin: "240",
      BMI: "37.8",
      DiabetesPedigreeFunction: "1.12",
      Age: "55",
    },
  };

  const fields = [
    {
      key: "Pregnancies",
      label: "Number of Pregnancies",
      min: 0,
      max: 20,
      placeholder: "0-20",
      reference: "Typical: 0-6",
      source: "History-based",
      testInfo: "Obtained from clinical history; no lab test required.",
    },
    {
      key: "Glucose",
      label: "Plasma Glucose (mg/dL)",
      min: 70,
      max: 200,
      placeholder: "70-200",
      reference: "Fasting normal: <100",
      source: "Lab-required",
      testInfo: "Blood glucose testing (FPG, random glucose, or OGTT).",
    },
    {
      key: "BloodPressure",
      label: "Diastolic BP (mmHg)",
      min: 60,
      max: 122,
      placeholder: "60-122",
      reference: "Typical: 60-80",
      source: "Home/clinic measurement",
      testInfo: "Measured using BP cuff (clinic or validated home monitor).",
    },
    {
      key: "SkinThickness",
      label: "Triceps Skin Fold (mm)",
      min: 0,
      max: 99,
      placeholder: "0-99",
      reference: "Typical: 10-35",
      source: "Clinic measurement",
      testInfo: "Measured with skinfold caliper; less common in routine care.",
    },
    {
      key: "Insulin",
      label: "2-Hour Serum Insulin (mu U/mL)",
      min: 0,
      max: 846,
      placeholder: "0-846",
      reference: "Typical: 16-166",
      source: "Lab-required",
      testInfo: "Serum insulin assay, often with glucose challenge.",
    },
    {
      key: "BMI",
      label: "Body Mass Index (kg/m^2)",
      min: 18,
      max: 67,
      placeholder: "18-67",
      step: "0.1",
      reference: "Healthy: 18.5-24.9",
      source: "Home/clinic measurement",
      testInfo: "Calculated from height and weight; no blood test required.",
    },
    {
      key: "DiabetesPedigreeFunction",
      label: "Diabetes Pedigree Function",
      min: 0,
      max: 2.5,
      placeholder: "0-2.5",
      step: "0.01",
      reference: "Higher means stronger family risk",
      source: "Derived score",
      testInfo: "Calculated from family history profile; not a standard lab test.",
    },
    {
      key: "Age",
      label: "Age (years)",
      min: 21,
      max: 81,
      placeholder: "21-81",
      reference: "Risk increases with age",
      source: "History-based",
      testInfo: "Demographic data; no test required.",
    },
  ];

  const sourceClassMap = {
    "History-based": "bg-blue-100 text-blue-700 border-blue-200",
    "Home/clinic measurement": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Clinic measurement": "bg-teal-100 text-teal-700 border-teal-200",
    "Lab-required": "bg-purple-100 text-purple-700 border-purple-200",
    "Derived score": "bg-amber-100 text-amber-700 border-amber-200",
  };

  const applyPreset = (presetKey) => {
    setFormData(presets[presetKey]);
    setErrors({});
  };

  const handleSexChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      Sex: value,
      // Model requires Pregnancies; for non-female sex, use clinical default 0.
      Pregnancies: value === "female" ? prev.Pregnancies : "0",
    }));

    setErrors((prev) => ({
      ...prev,
      Sex: "",
      Pregnancies: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Sex) {
      newErrors.Sex = "Please select sex.";
    }

    fields.forEach(({ key, min, max }) => {
      if (key === "Pregnancies" && formData.Sex !== "female") {
        return;
      }

      const value = parseFloat(formData[key]);

      if (formData[key] === "") {
        newErrors[key] = "Required";
      } else if (isNaN(value)) {
        newErrors[key] = "Must be a number";
      } else if (value < min || value > max) {
        newErrors[key] = `Must be between ${min} and ${max}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert all values to numbers
    const payload = {};
    fields.forEach(({ key }) => {
      if (key === "Pregnancies" && formData.Sex !== "female") {
        payload[key] = 0;
      } else {
        payload[key] = parseFloat(formData[key]);
      }
    });

    onPredict(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/60 p-4 sm:p-5">
        <label className="block text-sm font-bold uppercase tracking-[0.12em] text-cyan-900">Sex</label>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          "Number of Pregnancies" is asked only for female because this model was trained with that feature.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">
            <input
              type="radio"
              name="Sex"
              value="female"
              checked={formData.Sex === "female"}
              onChange={handleSexChange}
            />
            Female
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">
            <input
              type="radio"
              name="Sex"
              value="male"
              checked={formData.Sex === "male"}
              onChange={handleSexChange}
            />
            Male
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">
            <input
              type="radio"
              name="Sex"
              value="other"
              checked={formData.Sex === "other"}
              onChange={handleSexChange}
            />
            Other
          </label>
        </div>
        {errors.Sex && <p className="mt-2 text-xs text-red-600">{errors.Sex}</p>}
      </div>

      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-900">Use Real-World Sample Data</p>
        <p className="mt-1 text-xs text-slate-600">
          Choose a preset to auto-fill all required clinical fields.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("baselineAdult")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Baseline Adult
          </button>
          <button
            type="button"
            onClick={() => applyPreset("prediabetesPattern")}
            className="rounded-xl border border-amber-300 bg-amber-100/70 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
          >
            Prediabetes Pattern
          </button>
          <button
            type="button"
            onClick={() => applyPreset("highRiskPattern")}
            className="rounded-xl border border-rose-300 bg-rose-100/70 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100"
          >
            High-Risk Pattern
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Input Availability Guide</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-blue-700">
            History-based
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-emerald-700">
            Home/clinic measurement
          </span>
          <span className="rounded-full border border-purple-200 bg-purple-100 px-2 py-0.5 text-purple-700">
            Lab-required
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-amber-700">
            Derived score
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields
          .filter(({ key }) => key !== "Pregnancies" || formData.Sex === "female")
          .map(({ key, label, placeholder, step, reference, source, testInfo }) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-bold text-slate-800">
                {label}
              </label>
              <span
                className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  sourceClassMap[source] || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {source}
              </span>
            </div>
            <input
              type="number"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={placeholder}
              step={step || "1"}
              className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition ${
                errors[key]
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              }`}
            />
            <p className="mt-1 text-xs font-semibold text-slate-500">{reference}</p>
            <p className="mt-1 text-xs text-slate-500">{testInfo}</p>
            {errors[key] && (
              <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-teal-700 to-cyan-600 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-white shadow-[0_12px_24px_rgba(13,148,136,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3"
      >
        {loading ? "Predicting..." : "Predict Diabetes Risk"}
      </button>
    </form>
  );
}

export default DiabetesPredictionForm;
