import { useState } from "react";
import type { JournalEntry } from "./types";
import { MOODS } from "./types";
import EntryEditor from "./EntryEditor";

interface EntryListProps {
  entries: JournalEntry[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tagFilter: string | null;
  onTagFilter: (tag: string | null) => void;
  allTags: { tag: string; count: number }[];
  onUpdate: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

export default function EntryList({
  entries,
  searchQuery,
  onSearchChange,
  tagFilter,
  onTagFilter,
  allTags,
  onUpdate,
  onDelete,
}: EntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "var(--muted)" }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border py-3 pr-4 pl-10 text-sm"
          style={{
            background: "var(--panel)",
            color: "var(--ink)",
            borderColor: "var(--line)",
          }}
        />
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagFilter && (
            <button
              onClick={() => onTagFilter(null)}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: "var(--error)" + "22",
                color: "var(--error)",
              }}
            >
              Clear filter
            </button>
          )}
          {allTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => onTagFilter(tagFilter === tag ? null : tag)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-all"
              style={{
                background:
                  tagFilter === tag
                    ? "var(--accent)" + "22"
                    : "var(--panel)",
                color: tagFilter === tag ? "var(--accent)" : "var(--muted)",
                border:
                  tagFilter === tag
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line)",
              }}
            >
              {tag}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Entry list */}
      {entries.length === 0 ? (
        <div
          className="rounded-lg py-12 text-center text-sm"
          style={{ color: "var(--muted)" }}
        >
          {searchQuery || tagFilter
            ? "No entries match your search."
            : "No entries yet. Start writing!"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const moodInfo = MOODS[entry.mood];

            if (editingId === entry.id) {
              return (
                <div
                  key={entry.id}
                  className="rounded-lg border p-4"
                  style={{ borderColor: "var(--line)" }}
                >
                  <EntryEditor
                    existingEntry={entry}
                    onSave={(updated) => {
                      onUpdate(updated);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              );
            }

            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                className="cursor-pointer rounded-lg border p-4 transition-all hover:shadow-sm"
                style={{
                  borderColor: "var(--line)",
                  background: "var(--paper)",
                }}
                onClick={() =>
                  setExpandedId(isExpanded ? null : entry.id)
                }
              >
                <div className="flex items-start gap-3">
                  {/* Mood icon */}
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ background: moodInfo.color + "22" }}
                  >
                    {moodInfo.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      {entry.title && (
                        <span className="truncate font-semibold">
                          {entry.title}
                        </span>
                      )}
                      <span
                        className="shrink-0 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        {formatDate(entry.date)}
                      </span>
                    </div>

                    {/* Preview / full body */}
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "var(--muted)" }}
                    >
                      {isExpanded
                        ? entry.body
                        : truncate(entry.body, 150)}
                    </p>

                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full px-2 py-0.5 text-xs"
                            style={{
                              background: "var(--panel)",
                              color: "var(--muted)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expanded actions */}
                    {isExpanded && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(entry.id);
                          }}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium"
                          style={{
                            background: "var(--accent)" + "18",
                            color: "var(--accent)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this entry?")) {
                              onDelete(entry.id);
                              setExpandedId(null);
                            }
                          }}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium"
                          style={{
                            background: "var(--error)" + "18",
                            color: "var(--error)",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
