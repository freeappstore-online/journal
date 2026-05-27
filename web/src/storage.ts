import type { JournalEntry } from "./types";

const STORAGE_KEY = "journal-entries";

export function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as JournalEntry[];
  } catch {
    return [];
  }
}

export function saveEntries(entries: JournalEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(entry: JournalEntry): JournalEntry[] {
  const entries = loadEntries();
  entries.unshift(entry);
  saveEntries(entries);
  return entries;
}

export function updateEntry(updated: JournalEntry): JournalEntry[] {
  const entries = loadEntries().map((e) =>
    e.id === updated.id ? updated : e,
  );
  saveEntries(entries);
  return entries;
}

export function deleteEntry(id: string): JournalEntry[] {
  const entries = loadEntries().filter((e) => e.id !== id);
  saveEntries(entries);
  return entries;
}

export function exportEntries(): string {
  return JSON.stringify(loadEntries(), null, 2);
}

export function importEntries(json: string): JournalEntry[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid format: expected array");
  // Basic validation
  for (const item of parsed) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("id" in item) ||
      !("date" in item) ||
      !("body" in item) ||
      !("mood" in item)
    ) {
      throw new Error("Invalid entry format");
    }
  }
  const entries = parsed as JournalEntry[];
  saveEntries(entries);
  return entries;
}
