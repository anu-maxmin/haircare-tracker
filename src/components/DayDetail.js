// components/DayDetail.js
import { useState, useEffect } from 'react';
import { MONTHS, DAYS, getRoutineDayIndex, formatDate } from '../lib/utils';

export default function DayDetail({ dateKey, weeklyRoutine, routineStartDate, completions, onUpdateCompletion, onEditDay }) {
  const date = new Date(dateKey + 'T00:00:00');
  const dayName = DAYS[date.getDay()];
  const routineIdx = getRoutineDayIndex(date, routineStartDate);
  const dayRoutine = routineIdx !== null ? weeklyRoutine[routineIdx] : null;
  const completion = completions[dateKey] || { steps: {}, allDone: false };
  const today = formatDate(new Date());
  const isFuture = dateKey > today;

  function toggleStep(stepId) {
    if (isFuture) return;
    const newSteps = { ...completion.steps, [stepId]: !completion.steps[stepId] };
    const allDone = dayRoutine?.steps.length > 0 && dayRoutine.steps.every(s => newSteps[s.id]);
    onUpdateCompletion(dateKey, { steps: newSteps, allDone });
  }

  function markAllDone() {
    if (!dayRoutine || isFuture) return;
    const newSteps = {};
    dayRoutine.steps.forEach(s => { newSteps[s.id] = true; });
    onUpdateCompletion(dateKey, { steps: newSteps, allDone: true });
  }

  function resetDay() {
    onUpdateCompletion(dateKey, { steps: {}, allDone: false });
  }

  const completedCount = dayRoutine?.steps.filter(s => completion.steps[s.id]).length || 0;
  const totalCount = dayRoutine?.steps.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!dayRoutine) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-blush/40 p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
        <span className="text-4xl mb-3">📅</span>
        <h3 className="font-display text-lg text-charcoal">Before Routine Start</h3>
        <p className="text-bark/60 text-sm mt-1">This date is before your routine start date.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blush/40 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-bark to-mink p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">{dayName}</p>
            <h2 className="font-display text-2xl font-semibold mt-0.5">
              {date.getDate()} {MONTHS[date.getMonth()]}
            </h2>
            {isFuture && <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 mt-2 inline-block">Upcoming</span>}
          </div>
          <button
            onClick={() => onEditDay(routineIdx)}
            className="bg-white/20 hover:bg-white/30 transition-colors text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            Edit Day
          </button>
        </div>

        {/* Progress bar */}
        {!isFuture && totalCount > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/80 mb-1.5">
              <span>{completedCount} of {totalCount} steps</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="p-6">
        {totalCount === 0 ? (
          <div className="text-center py-6 text-bark/50">
            <p className="text-3xl mb-2">🌿</p>
            <p className="text-sm">Rest day — no steps scheduled.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayRoutine.steps.map((step, idx) => {
              const done = !!completion.steps[step.id];
              return (
                <label
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    done ? 'bg-sage/20 border border-moss/30' : 'bg-cream border border-blush/30 hover:border-mink/40'
                  } ${isFuture ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="custom-check mt-0.5"
                    checked={done}
                    onChange={() => toggleStep(step.id)}
                  />
                  <span className={`text-sm leading-relaxed ${done ? 'text-bark/60 line-through' : 'text-charcoal'}`}>
                    {step.text}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        {!isFuture && totalCount > 0 && (
          <div className="flex gap-2 mt-5 pt-5 border-t border-blush/30">
            {!completion.allDone && (
              <button
                onClick={markAllDone}
                className="flex-1 py-2.5 rounded-xl bg-moss text-white text-sm font-medium hover:bg-moss/80 transition-colors"
              >
                ✓ Mark All Done
              </button>
            )}
            {completion.allDone && (
              <div className="flex-1 py-2.5 rounded-xl bg-sage/30 text-moss text-sm font-medium text-center">
                🎉 All done!
              </div>
            )}
            {completedCount > 0 && (
              <button
                onClick={resetDay}
                className="px-4 py-2.5 rounded-xl border border-blush text-bark/60 text-sm hover:bg-blush/30 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
