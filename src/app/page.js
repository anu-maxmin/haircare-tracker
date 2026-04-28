"use client";

import { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import DayDetail from "../components/DayDetail";
import RoutineEditor from "../components/RoutineEditor";
import SetupModal from "../components/SetupModal";
import Toast from "../components/Toast";
import {
  formatDate,
  getTodayKey,
  getRoutineDayIndex,
  DAYS,
} from "../lib/utils";
import { useRoutine } from "../lib/useRoutine";
import { usePushNotification } from "../lib/usePushNotification";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [showEditor, setShowEditor] = useState(false);
  const [editingDayIdx, setEditingDayIdx] = useState(null);
  const [toast, setToast] = useState(null);
  const { supported, permission, subscribe } = usePushNotification();

  const {
    weeklyRoutine,
    completions,
    routineStartDate,
    loading,
    error,
    saveRoutine,
    saveCompletion,
    saveStartDate,
  } = useRoutine();

  const isSetup = !!routineStartDate;

  useEffect(() => {
    setMounted(true);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleSetup(startDate) {
    try {
      await saveStartDate(startDate);
      showToast("Routine started! 🌿", "success");
    } catch {
      showToast("Could not save start date", "error");
    }
  }

  async function handleUpdateCompletion(dateKey, data) {
    try {
      await saveCompletion(dateKey, data);
      if (data.allDone) showToast("Today's routine complete! 🎉", "success");
    } catch {
      showToast("Could not save — check connection", "error");
    }
  }

  async function handleSaveRoutine(newRoutine) {
    try {
      await saveRoutine(newRoutine);
      setShowEditor(false);
      setEditingDayIdx(null);
      showToast("Routine saved! ✓", "success");
    } catch {
      showToast("Could not save routine — check connection", "error");
    }
  }

  async function handleChangeStartDate() {
    const newDate = prompt(
      "Enter new start date (YYYY-MM-DD):",
      routineStartDate,
    );
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      try {
        await saveStartDate(newDate);
        showToast("Start date updated!", "success");
      } catch {
        showToast("Could not update start date", "error");
      }
    }
  }

  function handleEditDay(dayIdx) {
    setEditingDayIdx(dayIdx);
    setShowEditor(true);
  }

  function showToast(message, type = "info") {
    setToast({ message, type, id: Date.now() });
  }

  async function handleNotificationToggle() {
    if (permission === "granted") {
      showToast("Notifications already enabled!", "info");
      return;
    }
    const result = await subscribe();
    if (result.ok) {
      showToast("Daily reminders enabled at 8 PM 🔔", "success");
    } else {
      showToast("Could not enable notifications", "error");
    }
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const streak = (() => {
    let count = 0;
    let d = new Date();
    d.setHours(0, 0, 0, 0);
    while (true) {
      const key = formatDate(d);
      const c = completions[key];
      if (!c?.allDone) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const totalDone = Object.values(completions).filter((c) => c.allDone).length;

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (!mounted) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center border border-blush/40 shadow">
          <p className="text-3xl mb-3">⚠️</p>
          <h2 className="font-display text-xl text-charcoal mb-2">
            Database Error
          </h2>
          <p className="text-bark/70 text-sm mb-4">{error}</p>
          <p className="text-xs text-bark/50">
            Make sure your{" "}
            <code className="bg-cream px-1 rounded">.env.local</code> has{" "}
            <code className="bg-cream px-1 rounded">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="bg-cream px-1 rounded">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            set correctly.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🌿</div>
          <p className="text-bark/60 text-sm font-medium">
            Loading your routine...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white border-b border-blush/50 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌿</span>
              <div>
                <h1 className="font-display text-xl text-charcoal font-semibold leading-none">
                  HairCare
                </h1>
                <p className="text-xs text-bark/60 mt-0.5 leading-none">
                  Routine Tracker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {supported && (
                <button
                  onClick={handleNotificationToggle}
                  title={
                    permission === "granted"
                      ? "Notifications on"
                      : "Enable reminders"
                  }
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    permission === "granted"
                      ? "bg-moss/20 text-moss"
                      : "bg-blush/50 text-bark hover:bg-blush"
                  }`}
                >
                  {permission === "granted" ? "🔔" : "🔕"}
                </button>
              )}
              <button
                onClick={() => {
                  setEditingDayIdx(null);
                  setShowEditor(true);
                }}
                className="px-4 py-2 rounded-xl bg-bark text-white text-sm font-medium hover:bg-bark/80 transition-colors"
              >
                Edit Routine
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Stats */}
          {isSetup && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 border border-blush/40 text-center">
                <div className="font-display text-3xl text-bark font-bold">
                  {streak}
                </div>
                <div className="text-xs text-bark/60 mt-0.5 font-medium">
                  Day streak
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-blush/40 text-center">
                <div className="font-display text-3xl text-moss font-bold">
                  {totalDone}
                </div>
                <div className="text-xs text-bark/60 mt-0.5 font-medium">
                  Days done
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-blush/40 text-center">
                <div className="font-display text-2xl text-mink font-bold">
                  {routineStartDate
                    ? (() => {
                        const dayIdx = getRoutineDayIndex(
                          new Date(),
                          routineStartDate,
                        );
                        return dayIdx !== null ? DAYS[dayIdx].slice(0, 3) : "-";
                      })()
                    : "-"}
                </div>
                <div className="text-xs text-bark/60 mt-0.5 font-medium">
                  Today&apos;s day
                </div>
              </div>
            </div>
          )}

          {/* Calendar + Day Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isSetup ? (
              <Calendar
                routineStartDate={routineStartDate}
                completions={completions}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-blush/40 p-8 flex flex-col items-center justify-center text-center">
                <span className="text-4xl mb-3">📅</span>
                <h2 className="font-display text-xl text-charcoal mb-2">
                  Set Up Your Routine
                </h2>
                <p className="text-bark/60 text-sm mb-4">
                  Pick a start date to begin tracking your hair care cycle.
                </p>
              </div>
            )}

            {isSetup && (
              <DayDetail
                dateKey={selectedDate}
                weeklyRoutine={weeklyRoutine}
                routineStartDate={routineStartDate}
                completions={completions}
                onUpdateCompletion={handleUpdateCompletion}
                onEditDay={handleEditDay}
              />
            )}
          </div>

          {/* Start date row */}
          {isSetup && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-2xl p-4 border border-blush/40">
              <div>
                <p className="text-sm font-medium text-charcoal">
                  Routine Start Date
                </p>
                <p className="text-xs text-bark/60 mt-0.5">
                  {new Date(routineStartDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
              <button
                onClick={handleChangeStartDate}
                className="text-xs text-bark/60 hover:text-bark underline"
              >
                Change
              </button>
            </div>
          )}
        </main>
      </div>

      {!isSetup && <SetupModal onComplete={handleSetup} />}

      {showEditor && (
        <RoutineEditor
          weeklyRoutine={weeklyRoutine}
          onSave={handleSaveRoutine}
          onClose={() => {
            setShowEditor(false);
            setEditingDayIdx(null);
          }}
        />
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
