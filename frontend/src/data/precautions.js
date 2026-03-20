const diseasePrecautions = {
  flu: [
    "Get enough rest and stay hydrated.",
    "Use fever reducers only as advised by a doctor.",
    "Avoid close contact with others until symptoms improve.",
  ],
  covid: [
    "Isolate and monitor oxygen levels if possible.",
    "Seek medical care if breathing worsens.",
    "Follow local public health guidance.",
  ],
  malaria: [
    "Consult a doctor urgently for antimalarial treatment.",
    "Drink fluids and manage fever carefully.",
    "Do not delay treatment if fever persists.",
  ],
  diabetes: [
    "Monitor blood sugar regularly.",
    "Follow a balanced low-sugar diet.",
    "Take prescribed medications on schedule.",
  ],
  hypertension: [
    "Reduce salt intake and avoid smoking.",
    "Exercise regularly based on medical advice.",
    "Check blood pressure consistently.",
  ],
};

const defaultPrecautions = [
  "Consult a qualified doctor for a proper diagnosis.",
  "Do not self-medicate without professional advice.",
  "Seek urgent medical help if symptoms get worse.",
];

export function getPrecautionsByDisease(diseaseName) {
  const key = String(diseaseName || "").toLowerCase();
  return diseasePrecautions[key] || defaultPrecautions;
}
