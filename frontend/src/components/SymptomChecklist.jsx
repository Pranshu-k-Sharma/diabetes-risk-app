function SymptomChecklist({ items, selected, onToggle }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((symptom) => {
        const checked = selected.includes(symptom);

        return (
          <label
            key={symptom}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-primary/40"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(symptom)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-700">
              {symptom.replaceAll("_", " ")}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default SymptomChecklist;
