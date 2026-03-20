import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";

function HomePage() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl text-center">
        <p className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Intelligent Clinical Support
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-800 sm:text-5xl">
          AI Medical Diagnosis Assistant
        </h1>
        <p className="mt-4 text-base text-slate-600 sm:text-lg">
          Select symptoms, run the prediction model, and review estimated disease outcome with recommended precautions.
        </p>

        <button
          onClick={() => navigate("/symptoms")}
          className="mt-8 rounded-xl bg-primary px-6 py-3 text-base font-bold text-white transition hover:bg-teal-700"
        >
          Start Diagnosis
        </button>
      </div>
    </PageShell>
  );
}

export default HomePage;
