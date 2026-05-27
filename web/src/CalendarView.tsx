import { useState, useMemo } from "react";
import type { JournalEntry, Mood } from "./types";
import { MOODS } from "./types";

interface CalendarViewProps {
  entries: JournalEntry[];
  onSelectDate: (date: string) => void;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const MONTH_NAMES = [
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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({ entries, onSelectDate }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const entryMap = useMemo(() => {
    const map = new Map<string, Mood>();
    // Use the most recent mood for each day
    const sorted = [...entries].sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt),
    );
    for (const e of sorted) {
      map.set(e.date, e.mood);
    }
    return map;
  }, [entries]);

  const days = daysInMonth(year, month);
  const startDay = firstDayOfWeek(year, month);
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg p-2 transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="font-display text-lg font-bold">
          {MONTH_NAMES[month]!} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg p-2 transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium"
            style={{ color: "var(--muted)" }}
          >
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
          const mood = entryMap.get(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className="relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-medium transition-all"
              style={{
                background: mood
                  ? MOODS[mood].color + "18"
                  : "transparent",
                border: isToday
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                color: isToday ? "var(--accent)" : "var(--ink)",
              }}
            >
              {day}
              {mood && (
                <span
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full"
                  style={{ background: MOODS[mood].color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {(Object.entries(MOODS) as [Mood, (typeof MOODS)[Mood]][]).map(
          ([key, info]) => (
            <div key={key} className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: info.color }}
              />
              {info.label}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
