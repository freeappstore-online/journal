export type Mood = "great" | "good" | "okay" | "meh" | "bad";

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  body: string;
  mood: Mood;
  tags: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export const MOODS: Record<Mood, { emoji: string; label: string; color: string }> = {
  great: { emoji: "\u{1F929}", label: "Great", color: "var(--mood-great)" },
  good: { emoji: "\u{1F60A}", label: "Good", color: "var(--mood-good)" },
  okay: { emoji: "\u{1F642}", label: "Okay", color: "var(--mood-okay)" },
  meh: { emoji: "\u{1F615}", label: "Meh", color: "var(--mood-meh)" },
  bad: { emoji: "\u{1F61E}", label: "Bad", color: "var(--mood-bad)" },
};

export const MOOD_ORDER: Mood[] = ["great", "good", "okay", "meh", "bad"];

export type View = "write" | "list" | "calendar" | "stats" | "settings";
