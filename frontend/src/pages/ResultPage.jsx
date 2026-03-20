import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import ResultSummary from "../components/ResultSummary";
import { getPrecautionsByDisease } from "../data/precautions";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  const selectedSymptoms = location.state?.selectedSymptoms || [];

  const precautions = useMemo(() => {
    return getPrecautionsByDisease(result?.disease);
  }, [result?.disease]);

  if (!result) {
    return (
      <PageShell>
        <h1 className="text-2xl font-black text-slate-800">Result Not Available</h1>
        <p className="mt-2 text-slate-600">
          No prediction data was found. Please go back and submit symptoms first.
        </p>
        <Link
          to="/symptoms"
          className="mt-6 inline-block rounded-xl bg-primary px-5 py-2 font-semibold text-white transition hover:bg-teal-700"
        >
          Go to Symptom Selection
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
        Diagnosis Report
      </h1>
      <p className="mt-2 text-slate-600">
        This result is model-generated and should be confirmed by a healthcare professional.
      </p>

      <div className="mt-6">
        <ResultSummary
          disease={result.disease}
          confidence={result.confidence}
          precautions={precautions}
          selectedSymptoms={selectedSymptoms}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/symptoms")}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Recheck Symptoms
        </button>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-primary px-5 py-2 font-semibold text-white transition hover:bg-teal-700"
        >
          Home
        </button>
      </div>
    </PageShell>
  );
}

export default ResultPage;
