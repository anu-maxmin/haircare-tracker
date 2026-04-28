// components/RoutineEditor.js
import { useState } from 'react';
import { DAYS } from '../lib/utils';

export default function RoutineEditor({ weeklyRoutine, onSave, onClose }) {
  const [routine, setRoutine] = useState(() =>
    JSON.parse(JSON.stringify(weeklyRoutine)) // deep clone
  );
  const [activeDay, setActiveDay] = useState(0);

  function updateStep(dayIdx, stepIdx, value) {
    const updated = { ...routine };
    updated[dayIdx].steps[stepIdx].text = value;
    setRoutine(updated);
  }

  function addStep(dayIdx) {
    const updated = { ...routine };
    updated[dayIdx].steps.push({
      id: `step-${Date.now()}`,
      text: '',
    });
    setRoutine(updated);
  }

  function removeStep(dayIdx, stepIdx) {
    const updated = { ...routine };
    updated[dayIdx].steps.splice(stepIdx, 1);
    setRoutine(updated);
  }

  function moveStep(dayIdx, stepIdx, dir) {
    const updated = { ...routine };
    const steps = [...updated[dayIdx].steps];
    const newIdx = stepIdx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    [steps[stepIdx], steps[newIdx]] = [steps[newIdx], steps[stepIdx]];
    updated[dayIdx].steps = steps;
    setRoutine(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-cream rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-blush/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl text-charcoal">Edit Weekly Routine</h2>
              <p className="text-sm text-bark/70 mt-0.5">This cycle repeats every week</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-blush/50 flex items-center justify-center text-bark hover:bg-blush transition-colors text-lg">×</button>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1 px-6 pt-4 overflow-x-auto pb-1">
          {DAYS.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeDay === i
                  ? 'bg-bark text-white'
                  : 'text-bark hover:bg-blush/50'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Steps editor */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {routine[activeDay].steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-2 group animate-slide-up">
                <span className="mt-2.5 text-xs font-bold text-mink w-5 text-right flex-shrink-0">{idx + 1}</span>
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => updateStep(activeDay, idx, e.target.value)}
                  placeholder="Describe this step..."
                  className="flex-1 px-3 py-2 rounded-xl border border-blush bg-white text-sm text-charcoal placeholder-bark/40 focus:outline-none focus:ring-2 focus:ring-mink/60"
                />
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveStep(activeDay, idx, -1)} className="text-bark/50 hover:text-bark text-xs leading-none">▲</button>
                  <button onClick={() => moveStep(activeDay, idx, 1)} className="text-bark/50 hover:text-bark text-xs leading-none">▼</button>
                </div>
                <button
                  onClick={() => removeStep(activeDay, idx)}
                  className="mt-2 text-bark/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={() => addStep(activeDay)}
              className="w-full mt-2 py-2.5 rounded-xl border-2 border-dashed border-mink/40 text-mink text-sm font-medium hover:border-mink hover:bg-blush/20 transition-all"
            >
              + Add Step
            </button>

            {routine[activeDay].steps.length === 0 && (
              <p className="text-center text-bark/40 text-sm py-4">No steps yet — this is a rest day.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-blush/40 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-bark text-sm font-medium hover:bg-blush/40 transition-colors">Cancel</button>
          <button
            onClick={() => onSave(routine)}
            className="px-6 py-2 rounded-xl bg-bark text-white text-sm font-medium hover:bg-bark/80 transition-colors"
          >
            Save Routine
          </button>
        </div>
      </div>
    </div>
  );
}
