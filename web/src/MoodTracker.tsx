import { useRef, useEffect, useCallback } from "react";
import type { Mood } from "./types";
import { MOODS, MOOD_ORDER } from "./types";

interface MoodTrackerProps {
  moodTrend: { date: string; value: number }[];
  moodDistribution: Record<Mood, number>;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  totalWords: number;
  avgLength: number;
}

export default function MoodTracker({
  moodTrend,
  moodDistribution,
  currentStreak,
  longestStreak,
  totalEntries,
  totalWords,
  avgLength,
}: MoodTrackerProps) {
  const trendRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);

  const drawTrend = useCallback(() => {
    const canvas = trendRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padL = 40;
    const padR = 16;
    const padT = 16;
    const padB = 32;

    // Background
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor = isDark ? "#2d2d2d" : "#e5e7eb";
    const textColor = isDark ? "#9ca3af" : "#6b7280";

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const yLabels = ["Bad", "Meh", "Okay", "Good", "Great"];
    for (let i = 0; i < 5; i++) {
      const y = padT + ((4 - i) / 4) * (h - padT - padB);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "11px Manrope, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(yLabels[i]!, padL - 6, y + 4);
    }

    if (moodTrend.length === 0) {
      ctx.fillStyle = textColor;
      ctx.font = "14px Manrope, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No mood data yet", w / 2, h / 2);
      return;
    }

    // Plot points and line
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const points = moodTrend.map((pt, i) => ({
      x: padL + (moodTrend.length === 1 ? plotW / 2 : (i / (moodTrend.length - 1)) * plotW),
      y: padT + ((5 - pt.value) / 4) * plotH,
      value: pt.value,
    }));

    // Fill area under line
    const accentColor = isDark ? "#60a5fa" : "#2563eb";
    ctx.beginPath();
    ctx.moveTo(points[0]!.x, h - padB);
    for (const pt of points) {
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(points[points.length - 1]!.x, h - padB);
    ctx.closePath();
    ctx.fillStyle = accentColor + "18";
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0]!.x, points[0]!.y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i]!.x, points[i]!.y);
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Draw dots
    for (const pt of points) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.strokeStyle = isDark ? "#0f0f0f" : "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [moodTrend]);

  const drawPie = useCallback(() => {
    const canvas = pieRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const total = Object.values(moodDistribution).reduce((s, v) => s + v, 0);
    if (total === 0) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      ctx.fillStyle = isDark ? "#9ca3af" : "#6b7280";
      ctx.font = "14px Manrope, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data", w / 2, h / 2);
      return;
    }

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 8;

    let startAngle = -Math.PI / 2;
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    for (const mood of MOOD_ORDER) {
      const count = moodDistribution[mood];
      if (count === 0) continue;
      const slice = (count / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();

      // Parse CSS var color
      const rawColor = MOODS[mood].color;
      const computed = getComputedColor(rawColor, isDark, mood);
      ctx.fillStyle = computed;
      ctx.fill();

      // Label
      if (slice > 0.3) {
        const midAngle = startAngle + slice / 2;
        const labelR = r * 0.65;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Manrope, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(MOODS[mood].emoji, lx, ly);
      }

      startAngle += slice;
    }
  }, [moodDistribution]);

  useEffect(() => {
    drawTrend();
    drawPie();

    const handleResize = () => {
      drawTrend();
      drawPie();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawTrend, drawPie]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Entries" value={totalEntries.toString()} />
        <StatCard label="Total Words" value={totalWords.toLocaleString()} />
        <StatCard label="Avg Length" value={`${avgLength} words`} />
        <StatCard
          label="Current Streak"
          value={`${currentStreak} day${currentStreak !== 1 ? "s" : ""}`}
          accent
        />
      </div>

      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
        Longest streak:{" "}
        <span className="font-semibold" style={{ color: "var(--ink)" }}>
          {longestStreak} day{longestStreak !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Mood trend chart */}
      <div>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Mood Trend (Last 30 Days)
        </h3>
        <div
          className="rounded-lg border p-3"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <canvas
            ref={trendRef}
            className="h-48 w-full"
            style={{ display: "block" }}
          />
        </div>
      </div>

      {/* Mood distribution */}
      <div>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Mood Distribution (Last 30 Days)
        </h3>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          >
            <canvas
              ref={pieRef}
              className="h-48 w-48"
              style={{ display: "block" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {MOOD_ORDER.map((mood) => {
              const count = moodDistribution[mood];
              const total = Object.values(moodDistribution).reduce(
                (s, v) => s + v,
                0,
              );
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={mood} className="flex items-center gap-2 text-sm">
                  <span>{MOODS[mood].emoji}</span>
                  <span style={{ color: "var(--ink)" }}>{MOODS[mood].label}</span>
                  <span style={{ color: "var(--muted)" }}>
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-4 py-3"
      style={{
        borderColor: accent ? "var(--accent)" : "var(--line)",
        background: accent ? "var(--accent)" + "0c" : "var(--panel)",
      }}
    >
      <div
        className="text-xs font-medium"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-lg font-bold"
        style={{ color: accent ? "var(--accent)" : "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}

function getComputedColor(
  _cssVar: string,
  isDark: boolean,
  mood: Mood,
): string {
  const colors: Record<Mood, { light: string; dark: string }> = {
    great: { light: "#22c55e", dark: "#4ade80" },
    good: { light: "#3b82f6", dark: "#60a5fa" },
    okay: { light: "#f59e0b", dark: "#fbbf24" },
    meh: { light: "#f97316", dark: "#fb923c" },
    bad: { light: "#ef4444", dark: "#f87171" },
  };
  return isDark ? colors[mood].dark : colors[mood].light;
}
