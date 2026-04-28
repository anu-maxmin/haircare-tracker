// components/Calendar.js
import { useState } from 'react';
import { MONTHS, SHORT_DAYS, formatDate, getRoutineDayIndex } from '../lib/utils';

export default function Calendar({ routineStartDate, completions, onSelectDate, selectedDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey = formatDate(today);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blush/40 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blush/40 transition-colors text-bark font-bold">‹</button>
        <h2 className="font-display text-xl text-charcoal font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blush/40 transition-colors text-bark font-bold">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {SHORT_DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-bark/70 py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const dateObj = new Date(viewYear, viewMonth, day);
          const dateKey = formatDate(dateObj);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const routineIdx = getRoutineDayIndex(dateObj, routineStartDate);
          const hasRoutine = routineIdx !== null;
          const completion = completions[dateKey];
          const isDone = completion?.allDone;
          const isPartial = completion && !completion.allDone && Object.values(completion.steps || {}).some(Boolean);
          const isFuture = dateObj > today;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`
                cal-day relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium
                ${isSelected ? 'bg-bark text-white shadow-md scale-105' : ''}
                ${isToday && !isSelected ? 'bg-mink/30 text-bark font-bold ring-2 ring-mink' : ''}
                ${!isSelected && !isToday ? 'text-charcoal hover:bg-blush/50' : ''}
                ${isFuture && !hasRoutine ? 'opacity-30' : ''}
              `}
            >
              {day}
              {/* Completion dot */}
              {hasRoutine && !isFuture && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                  isDone ? 'bg-moss' : isPartial ? 'bg-mink' : 'bg-charcoal/20'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blush/30 text-xs text-bark/70">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-moss inline-block"/>Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-mink inline-block"/>Partial</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-charcoal/20 inline-block"/>Pending</span>
      </div>
    </div>
  );
}
