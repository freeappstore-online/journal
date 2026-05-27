import { useState, useCallback } from "react";
import type { View } from "./types";
import { useJournal } from "./useJournal";
import EntryEditor from "./EntryEditor";
import EntryList from "./EntryList";
import CalendarView from "./CalendarView";
import MoodTracker from "./MoodTracker";
import SettingsView from "./SettingsView";

const NAV_ITEMS: { view: View; label: string; icon: React.ReactNode }[] = [
  {
    view: "write",
    label: "Write",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
  },
  {
    view: "list",
    label: "Entries",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
        <path d="M15 3v4a2 2 0 0 0 2 2h4" />
        <path d="M10 12h4" />
        <path d="M10 16h4" />
      </svg>
    ),
  },
  {
    view: "calendar",
    label: "Calendar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    view: "stats",
    label: "Stats",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    view: "settings",
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function App() {
  const [view, setView] = useState<View>("write");
  const journal = useJournal();

  const handleCalendarSelect = useCallback(
    (date: string) => {
      // If there's an entry for this date, go to list filtered to that date
      const hasEntry = journal.entries.some((e) => e.date === date);
      if (hasEntry) {
        journal.setSearchQuery(date);
        setView("list");
      } else {
        // Switch to write view (user can pick the date)
        setView("write");
      }
    },
    [journal],
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 pt-6 pb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
          style={{ background: "var(--accent)" + "18" }}
        >
          {"\u{1F4D6}"}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Journal</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Your private daily diary
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-4">
        {view === "write" && (
          <EntryEditor
            onSave={(entry) => {
              journal.handleAdd(entry);
              setView("list");
            }}
          />
        )}

        {view === "list" && (
          <EntryList
            entries={journal.filteredEntries}
            searchQuery={journal.searchQuery}
            onSearchChange={journal.setSearchQuery}
            tagFilter={journal.tagFilter}
            onTagFilter={journal.setTagFilter}
            allTags={journal.allTags}
            onUpdate={journal.handleUpdate}
            onDelete={journal.handleDelete}
          />
        )}

        {view === "calendar" && (
          <CalendarView
            entries={journal.entries}
            onSelectDate={handleCalendarSelect}
          />
        )}

        {view === "stats" && (
          <MoodTracker
            moodTrend={journal.stats.moodTrend}
            moodDistribution={journal.stats.moodDistribution}
            currentStreak={journal.stats.currentStreak}
            longestStreak={journal.stats.longestStreak}
            totalEntries={journal.stats.totalEntries}
            totalWords={journal.stats.totalWords}
            avgLength={journal.stats.avgLength}
          />
        )}

        {view === "settings" && (
          <SettingsView
            onExport={journal.handleExport}
            onImport={journal.handleImport}
            entryCount={journal.entries.length}
          />
        )}
      </main>

      {/* Bottom navigation dock */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-lg"
        style={{
          background: "var(--glass)",
          borderColor: "var(--line)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  color: isActive ? "var(--accent)" : "var(--muted)",
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
