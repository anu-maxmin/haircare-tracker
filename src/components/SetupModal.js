// components/SetupModal.js
import { useState } from 'react';
import { formatDate } from '../lib/utils';

export default function SetupModal({ onComplete }) {
  const [startDate, setStartDate] = useState(formatDate(new Date()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4">
      <div className="bg-cream rounded-3xl shadow-2xl w-full max-w-md p-8 animate-slide-up text-center">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="font-display text-3xl text-charcoal font-semibold mb-2">Welcome</h1>
        <p className="text-bark/70 text-sm mb-8 leading-relaxed">
          Set a starting date for your weekly hair care cycle.<br />
          Your 7-day routine will repeat from this date.
        </p>

        <div className="text-left mb-6">
          <label className="block text-sm font-semibold text-bark mb-2">Routine Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-blush bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-mink/60 text-sm"
          />
          <p className="text-xs text-bark/50 mt-1.5">Day 1 of your cycle starts on this date.</p>
        </div>

        <button
          onClick={() => onComplete(startDate)}
          className="w-full py-3 rounded-xl bg-bark text-white font-semibold hover:bg-bark/80 transition-colors"
        >
          Start My Routine →
        </button>
      </div>
    </div>
  );
}
