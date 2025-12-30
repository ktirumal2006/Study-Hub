// frontend/src/components/PomodoroSettings.jsx
import React from "react";

export default function PomodoroSettings({ pomConfig, setPomConfig }) {
  return (
    <div className="mb-6 bg-white p-4 rounded shadow w-full max-w-sm">
      <h3 className="font-semibold mb-2">Pomodoro Settings (minutes)</h3>
      {Object.entries(pomConfig).map(([key, val]) => (
        <div key={key} className="flex items-center mb-2">
          <label className="w-32 capitalize">
            {key.replace(/([A-Z])/, ' $1')}:
          </label>
          <input
            type="number"
            value={val}
            onChange={(e) =>
              setPomConfig((c) => ({
                ...c,
                [key]: Math.max(1, parseInt(e.target.value) || 1),
              }))
            }
            className="flex-1 border rounded p-1 appearance-none"
            min="1"
          />
          {key !== "cycles" && <span className="ml-2 text-sm">min</span>}
        </div>
      ))}
    </div>
  );
}
