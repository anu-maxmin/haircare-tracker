// src/lib/useRoutine.js
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { DEFAULT_ROUTINE } from './utils';

export function useRoutine() {
  const [weeklyRoutine, setWeeklyRoutine] = useState(DEFAULT_ROUTINE);
  const [completions, setCompletions] = useState({});
  const [routineStartDate, setRoutineStartDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        await Promise.all([loadRoutine(), loadCompletions(), loadSettings()]);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Could not connect to database. Check your Supabase config.');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // ─── Routine ────────────────────────────────────────────────────────────────
  async function loadRoutine() {
    const { data, error } = await supabase.from('routine').select('*').order('day_index');
    if (error) throw error;

    if (data && data.length > 0) {
      const routine = {};
      data.forEach(row => {
        routine[row.day_index] = { label: row.label, steps: row.steps };
      });
      setWeeklyRoutine(routine);
    } else {
      await seedRoutine(DEFAULT_ROUTINE);
    }
  }

  async function seedRoutine(routine) {
    const rows = Object.entries(routine).map(([dayIndex, day]) => ({
      day_index: parseInt(dayIndex),
      label: day.label,
      steps: day.steps,
    }));
    const { error } = await supabase.from('routine').upsert(rows, { onConflict: 'day_index' });
    if (error) throw error;
  }

  async function saveRoutine(newRoutine) {
    setWeeklyRoutine(newRoutine);
    const rows = Object.entries(newRoutine).map(([dayIndex, day]) => ({
      day_index: parseInt(dayIndex),
      label: day.label,
      steps: day.steps,
    }));
    const { error } = await supabase.from('routine').upsert(rows, { onConflict: 'day_index' });
    if (error) { console.error('Failed to save routine:', error); throw error; }
  }

  // ─── Completions ────────────────────────────────────────────────────────────
  async function loadCompletions() {
    const { data, error } = await supabase.from('completions').select('*');
    if (error) throw error;

    if (data && data.length > 0) {
      const comps = {};
      data.forEach(row => {
        comps[row.date_key] = { steps: row.steps, allDone: row.all_done };
      });
      setCompletions(comps);
    }
  }

  async function saveCompletion(dateKey, data) {
    const updated = { ...completions, [dateKey]: data };
    setCompletions(updated);
    const { error } = await supabase.from('completions').upsert(
      { date_key: dateKey, steps: data.steps, all_done: data.allDone },
      { onConflict: 'date_key' }
    );
    if (error) { console.error('Failed to save completion:', error); throw error; }
  }

  // ─── Settings ───────────────────────────────────────────────────────────────
  async function loadSettings() {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;

    if (data) {
      const startRow = data.find(r => r.key === 'start_date');
      if (startRow) setRoutineStartDate(startRow.value);
    }
  }

  async function saveStartDate(date) {
    setRoutineStartDate(date);
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'start_date', value: date }, { onConflict: 'key' });
    if (error) { console.error('Failed to save start date:', error); throw error; }
  }

  return {
    weeklyRoutine,
    completions,
    routineStartDate,
    loading,
    error,
    saveRoutine,
    saveCompletion,
    saveStartDate,
  };
}
