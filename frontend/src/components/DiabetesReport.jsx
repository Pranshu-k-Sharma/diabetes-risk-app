import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function DiabetesReport({ result, inputData }) {
  const [showModal, setShowModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    fullName: "",
    sex: inputData?.Sex || "",
    age: inputData?.Age || "",
    patientId: "",
    physician: "",
    reportPurpose: "Screening",
    notes: "",
  });

  const generatedAt = new Date();
  const sectionStyle = {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  };
  const patientName = (patientDetails.fullName || "Not provided").toString();
  const patientId = (patientDetails.patientId || "Not provided").toString();
  const reportDateTime = `${generatedAt.toLocaleDateString()} ${generatedAt.toLocaleTimeString()}`;

  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    setPatientDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-50 border-green-200";
      case "Moderate":
        return "bg-yellow-50 border-yellow-200";
      case "High":
        return "bg-orange-50 border-orange-200";
      case "Very High":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getRiskTextColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "text-green-700";
      case "Moderate":
        return "text-yellow-700";
      case "High":
        return "text-orange-700";
      case "Very High":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  // Prepare data for charts
  const probabilityData = [
    { name: "Diabetes Risk", value: result.risk_percentage },
    { name: "No Diabetes", value: 100 - result.risk_percentage },
  ];

  const metricsComparisonData = [
    {
      metric: "Glucose",
      value: inputData.Glucose,
      reference: 100,
    },
    {
      metric: "BP",
      value: inputData.BloodPressure,
      reference: 80,
    },
    {
      metric: "BMI",
      value: inputData.BMI,
      reference: 24.9,
    },
    {
      metric: "Insulin",
      value: Math.min(inputData.Insulin / 2, 83), // Scale for visibility
      reference: 83,
    },
  ];

  const buildExportNode = () => {
    const source = document.getElementById("report-content");
    if (!source) {
      return null;
    }

    const clone = source.cloneNode(true);
    clone.querySelectorAll(".no-export").forEach((node) => node.remove());
    clone.style.background = "white";
    clone.style.padding = "24px";
    clone.style.width = "100%";

    return clone;
  };

  const downloadReport = async () => {
    const element = buildExportNode();
    if (!element) {
      return;
    }

    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: [18, 8, 16, 8],
      filename: "Diabetes_Risk_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      pagebreak: { mode: ["css", "legacy"] },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    const worker = html2pdf().set(opt).from(element).toPdf();

    await worker.get("pdf").then((pdf) => {
      const pageCount = pdf.internal.getNumberOfPages();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(31, 41, 55);
        pdf.text("Diabetes Risk Assessment Report", 8, 9);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(75, 85, 99);
        pdf.text(`Patient: ${patientName}`, 8, 13);
        pdf.text(`Patient ID: ${patientId}`, 70, 13);
        pdf.text(reportDateTime, pageWidth - 8, 13, { align: "right" });

        pdf.setDrawColor(203, 213, 225);
        pdf.line(8, 15, pageWidth - 8, 15);

        pdf.setDrawColor(203, 213, 225);
        pdf.line(8, pageHeight - 11, pageWidth - 8, pageHeight - 11);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Page ${page} of ${pageCount}`, pageWidth - 8, pageHeight - 6, {
          align: "right",
        });
      }
    });

    await worker.save();
  };

  const generatePrint = () => {
    const printableNode = buildExportNode();
    if (!printableNode) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Diabetes Risk Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
            h1, h2, h3, h4 { margin: 0 0 12px 0; }
            section { page-break-inside: avoid; break-inside: avoid; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background: #f3f4f6; }
            @media print {
              .print-hidden { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
    printWindow.document.body.appendChild(printableNode);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-600 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(13,148,136,0.35)] transition hover:brightness-105"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-4-2m4 2l4-2"
          />
        </svg>
        Generate Detailed Report
      </button>
    );
  }

  return (
    <>
      {/* Modal Background */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowModal(false)}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Report Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Diabetes Risk Assessment Report</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Generated on {generatedAt.toLocaleDateString()} at{" "}
                {generatedAt.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
            >
              ✕
            </button>
          </div>

          {/* Report Content */}
          <div id="report-content" className="p-8 space-y-8">
            {/* Patient Information */}
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-6" style={sectionStyle}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Patient And Report Details</h3>

              <div className="no-export grid grid-cols-1 gap-4 md:grid-cols-2 print:hidden">
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-semibold">Full Name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={patientDetails.fullName}
                    onChange={handleDetailsChange}
                    placeholder="Enter patient full name"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-semibold">Patient ID</span>
                  <input
                    type="text"
                    name="patientId"
                    value={patientDetails.patientId}
                    onChange={handleDetailsChange}
                    placeholder="Hospital/clinic ID"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-semibold">Sex</span>
                  <input
                    type="text"
                    name="sex"
                    value={patientDetails.sex}
                    onChange={handleDetailsChange}
                    placeholder="Female / Male / Other"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-semibold">Age</span>
                  <input
                    type="text"
                    name="age"
                    value={patientDetails.age}
                    onChange={handleDetailsChange}
                    placeholder="Age in years"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-semibold">Physician / Consultant</span>
                  <input
                    type="text"
                    name="physician"
                    value={patientDetails.physician}
                    onChange={handleDetailsChange}
                    placeholder="Doctor name"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-semibold">Report Purpose</span>
                  <select
                    name="reportPurpose"
                    value={patientDetails.reportPurpose}
                    onChange={handleDetailsChange}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Screening">Screening</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Routine Check">Routine Check</option>
                    <option value="Specialist Review">Specialist Review</option>
                  </select>
                </label>

                <label className="text-sm text-slate-700 md:col-span-2">
                  <span className="mb-1 block font-semibold">Additional Notes</span>
                  <textarea
                    name="notes"
                    value={patientDetails.notes}
                    onChange={handleDetailsChange}
                    rows={3}
                    placeholder="Clinical notes, symptoms, or follow-up instructions"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Included In Printed Report
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <p><span className="font-semibold">Full Name:</span> {patientDetails.fullName || "Not provided"}</p>
                  <p><span className="font-semibold">Patient ID:</span> {patientDetails.patientId || "Not provided"}</p>
                  <p><span className="font-semibold">Sex:</span> {patientDetails.sex || "Not provided"}</p>
                  <p><span className="font-semibold">Age:</span> {patientDetails.age || "Not provided"}</p>
                  <p><span className="font-semibold">Physician:</span> {patientDetails.physician || "Not provided"}</p>
                  <p><span className="font-semibold">Purpose:</span> {patientDetails.reportPurpose || "Not provided"}</p>
                </div>
                {patientDetails.notes && (
                  <p className="mt-3 text-sm text-slate-700">
                    <span className="font-semibold">Notes:</span> {patientDetails.notes}
                  </p>
                )}
              </div>
            </section>

            {/* Executive Summary */}
            <section style={sectionStyle}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Executive Summary</h3>
              <div
                className={`border-l-4 border-indigo-600 p-6 rounded ${getRiskBgColor(
                  result.risk_level
                )}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${getRiskTextColor(result.risk_level)}`}>
                      RISK LEVEL
                    </p>
                    <p className={`text-4xl font-bold ${getRiskTextColor(result.risk_level)} mt-2`}>
                      {result.risk_level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">DIABETES PROBABILITY</p>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">
                      {result.risk_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">
                  Based on the provided health metrics, your model indicates a{" "}
                  <span className={`font-bold ${getRiskTextColor(result.risk_level)}`}>
                    {result.risk_level.toLowerCase()}
                  </span>{" "}
                  risk of diabetes diagnosis.
                </p>
              </div>
            </section>

            {/* Prediction Overview */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2" style={sectionStyle}>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <p className="text-sm font-semibold text-indigo-700">PREDICTION RESULT</p>
                <p className="text-3xl font-bold text-indigo-900 mt-2">{result.prediction}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <p className="text-sm font-semibold text-purple-700">CONFIDENCE SCORE</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {Math.max(result.diabetes_probability, result.no_diabetes_probability)
                    .toFixed(2)
                    .replace("0.", "")}
                  %
                </p>
              </div>
            </section>

            {/* Visual Charts */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2" style={sectionStyle}>
              {/* Probability Distribution */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-hidden">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Risk Distribution</h4>
                <ResponsiveContainer width="100%" height={290}>
                  <PieChart>
                    <Pie
                      data={probabilityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={88}
                      fill="#8884d8"
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Comparison */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-hidden">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Key Metrics vs Reference
                </h4>
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={metricsComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Your Value" isAnimationActive={false} />
                    <Bar dataKey="reference" fill="#d1d5db" name="Reference" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Detailed Input Analysis */}
            <section style={sectionStyle}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Detailed Input Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left p-4 font-semibold">Metric</th>
                      <th className="text-center p-4 font-semibold">Your Value</th>
                      <th className="text-center p-4 font-semibold">Reference Range</th>
                      <th className="text-center p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "Glucose Level",
                        value: inputData.Glucose,
                        unit: "mg/dL",
                        range: "<100 (fasting)",
                      },
                      {
                        name: "Diastolic Blood Pressure",
                        value: inputData.BloodPressure,
                        unit: "mmHg",
                        range: "<80",
                      },
                      {
                        name: "Body Mass Index",
                        value: inputData.BMI,
                        unit: "kg/m²",
                        range: "18.5-24.9",
                      },
                      {
                        name: "Serum Insulin",
                        value: inputData.Insulin,
                        unit: "mu U/mL",
                        range: "16-166 (fasting)",
                      },
                    ].map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">{item.name}</td>
                        <td className="text-center p-4">
                          <span className="font-semibold text-indigo-600">
                            {item.value} {item.unit}
                          </span>
                        </td>
                        <td className="text-center p-4 text-gray-600">{item.range}</td>
                        <td className="text-center p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                            Review
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Clinical Interpretation */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6" style={sectionStyle}>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Clinical Interpretation</h3>
              <div className="space-y-3 text-blue-900 text-sm">
                <p>
                  • This assessment indicates a <strong>{result.risk_level.toLowerCase()}</strong> risk of diabetes based on the provided metrics.
                </p>
                <p>
                  • Key contributors to risk assessment include glucose levels, BMI, blood
                  pressure, insulin response, and family history factors.
                </p>
                <p>
                  • Regular monitoring of glucose metrics is recommended, especially if risk
                  factors are elevated.
                </p>
                <p>
                  • This tool provides an initial screening assessment and should not replace
                  professional medical evaluation.
                </p>
              </div>
            </section>

            {/* Recommendations */}
            <section className="bg-green-50 border border-green-200 rounded-lg p-6" style={sectionStyle}>
              <h3 className="text-xl font-bold text-green-900 mb-4">Health Recommendations</h3>
              <ul className="space-y-2 text-green-900 text-sm list-disc list-inside">
                <li>
                  <strong>Nutrition:</strong> Focus on balanced diet with whole grains, lean
                  proteins, and vegetables
                </li>
                <li>
                  <strong>Physical Activity:</strong> Aim for 150 minutes of moderate exercise
                  per week
                </li>
                <li>
                  <strong>Monitoring:</strong> Track blood glucose and weight regularly
                </li>
                <li>
                  <strong>Medical Check-up:</strong> Consult healthcare provider for comprehensive
                  evaluation
                </li>
                <li>
                  <strong>Stress Management:</strong> Practice relaxation techniques to reduce
                  stress-related glucose spikes
                </li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section className="bg-gray-50 border border-gray-300 rounded-lg p-6" style={sectionStyle}>
              <h3 className="text-sm font-bold text-gray-700 mb-3">MEDICAL DISCLAIMER</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                This report is generated by an AI model for screening purposes only. It is NOT
                a medical diagnosis and should NOT be used as a substitute for professional medical
                advice, examination, or treatment. Please consult a qualified healthcare provider
                for proper diagnosis and personalized treatment recommendations. The accuracy of
                predictions depends on the quality and completeness of input data.
              </p>
            </section>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 p-6 flex gap-4 justify-end print:hidden">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={generatePrint}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"
                />
              </svg>
              Print
            </button>
            <button
              onClick={downloadReport}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DiabetesReport;
