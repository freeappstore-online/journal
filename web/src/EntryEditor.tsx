import { useState, useCallback } from "react";
import type { JournalEntry, Mood } from "./types";
import { MOODS, MOOD_ORDER } from "./types";
import { getDailyPrompt } from "./prompts";

interface EntryEditorProps {
  existingEntry?: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  onCancel?: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EntryEditor({
  existingEntry,
  onSave,
  onCancel,
}: EntryEditorProps) {
  const [date, setDate] = useState(existingEntry?.date ?? todayStr());
  const [title, setTitle] = useState(existingEntry?.title ?? "");
  const [body, setBody] = useState(existingEntry?.body ?? "");
  const [mood, setMood] = useState<Mood>(existingEntry?.mood ?? "okay");
  const [tagInput, setTagInput] = useState(
    existingEntry?.tags.join(", ") ?? "",
  );

  const prompt = getDailyPrompt(date);
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  const handleSave = useCallback(() => {
    if (!body.trim()) return;

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: existingEntry?.id ?? crypto.randomUUID(),
      date,
      title: title.trim(),
      body: body.trim(),
      mood,
      tags,
      createdAt: existingEntry?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(entry);

    if (!existingEntry) {
      setTitle("");
      setBody("");
      setMood("okay");
      setTagInput("");
      setDate(todayStr());
    }
  }, [body, date, existingEntry, mood, onSave, tagInput, title]);

  return (
    <div className="flex flex-col gap-4">
      {/* Daily prompt */}
      <div
        className="rounded-lg px-4 py-3 text-sm italic"
        style={{ background: "var(--panel)", color: "var(--muted)" }}
      >
        <span className="not-italic font-semibold" style={{ color: "var(--accent)" }}>
          Prompt:
        </span>{" "}
        {prompt}
      </div>

      {/* Date */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            borderColor: "var(--line)",
          }}
        />
      </div>

      {/* Mood selector */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: "var(--muted)" }}>
          How are you feeling?
        </label>
        <div className="flex gap-2">
          {MOOD_ORDER.map((m) => {
            const info = MOODS[m];
            const isActive = mood === m;
            return (
              <button
                key={m}
                onClick={() => setMood(m)}
                className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                style={{
                  background: isActive ? info.color + "22" : "var(--panel)",
                  border: isActive
                    ? `2px solid ${info.color}`
                    : "2px solid transparent",
                  color: isActive ? info.color : "var(--muted)",
                }}
              >
                <span className="text-xl">{info.emoji}</span>
                <span className="text-xs">{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border px-4 py-3 text-base font-semibold"
        style={{
          background: "var(--panel)",
          color: "var(--ink)",
          borderColor: "var(--line)",
        }}
      />

      {/* Body */}
      <div className="relative">
        <textarea
          placeholder="Write your thoughts..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="w-full resize-y rounded-lg border px-4 py-3 text-base leading-relaxed"
          style={{
            background: "var(--panel)",
            color: "var(--ink)",
            borderColor: "var(--line)",
          }}
        />
        <span
          className="absolute right-3 bottom-3 text-xs"
          style={{ color: "var(--muted)" }}
        >
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>

      {/* Tags */}
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        className="rounded-lg border px-4 py-3 text-sm"
        style={{
          background: "var(--panel)",
          color: "var(--ink)",
          borderColor: "var(--line)",
        }}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!body.trim()}
          className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {existingEntry ? "Update Entry" : "Save Entry"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg px-6 py-3 text-sm font-medium"
            style={{ color: "var(--muted)" }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
