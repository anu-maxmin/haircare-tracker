// src/lib/utils.js

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Default weekly routine template
export const DEFAULT_ROUTINE = {
  0: {
    label: "Sunday",
    steps: [
      { id: "s1", text: "Deep condition with a hair mask for 30 minutes" },
      { id: "s2", text: "Rinse thoroughly with cool water" },
      { id: "s3", text: "Apply leave-in conditioner" },
    ],
  },
  1: {
    label: "Monday",
    steps: [
      { id: "m1", text: "Co-wash or rinse hair" },
      { id: "m2", text: "Detangle with wide-tooth comb" },
      { id: "m3", text: "Apply lightweight serum to ends" },
    ],
  },
  2: {
    label: "Tuesday",
    steps: [
      { id: "t1", text: "Scalp massage with oil for 5 minutes" },
      { id: "t2", text: "Brush gently to distribute oil" },
    ],
  },
  3: {
    label: "Wednesday",
    steps: [
      { id: "w1", text: "Wash hair with sulfate-free shampoo" },
      { id: "w2", text: "Condition mid-lengths to ends" },
      { id: "w3", text: "Air dry or diffuse on low heat" },
    ],
  },
  4: {
    label: "Thursday",
    steps: [
      { id: "th1", text: "Apply scalp tonic or growth serum" },
      { id: "th2", text: "Protective style if needed" },
    ],
  },
  5: {
    label: "Friday",
    steps: [
      { id: "f1", text: "Dry shampoo roots if needed" },
      { id: "f2", text: "Detangle and style as desired" },
      { id: "f3", text: "Apply shine spray to ends" },
    ],
  },
  6: {
    label: "Saturday",
    steps: [
      { id: "sa1", text: "Pre-poo treatment with coconut oil" },
      { id: "sa2", text: "Steam treatment or hot towel wrap" },
      { id: "sa3", text: "Trim split ends if necessary" },
    ],
  },
};

// Returns the routine index (0=Sun, 1=Mon, ... 6=Sat) for a given date.
// Returns null if the date is before routineStartDate.
export function getRoutineDayIndex(date, routineStartDate) {
  const start = new Date(routineStartDate);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Before routine started — no routine
  if (d < start) return null;
  // Use the actual day-of-week (0=Sun … 6=Sat) — not an offset from start
  return d.getDay();
}

export function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getTodayKey() {
  return formatDate(new Date());
}

export function loadData(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
