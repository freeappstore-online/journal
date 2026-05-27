import { useState, useCallback, useMemo } from "react";
import type { JournalEntry, Mood } from "./types";
import {
  loadEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  exportEntries,
  importEntries,
} from "./storage";

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadEntries());
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const handleAdd = useCallback((entry: JournalEntry) => {
    setEntries(addEntry(entry));
  }, []);

  const handleUpdate = useCallback((entry: JournalEntry) => {
    setEntries(updateEntry(entry));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setEntries(deleteEntry(id));
  }, []);

  const handleExport = useCallback(() => {
    const json = exportEntries();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((json: string) => {
    const imported = importEntries(json);
    setEntries(imported);
  }, []);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (tagFilter) {
      result = result.filter((e) => e.tags.includes(tagFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [entries, searchQuery, tagFilter]);

  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    for (const entry of entries) {
      for (const tag of entry.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [entries]);

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce(
      (sum, e) => sum + e.body.split(/\s+/).filter(Boolean).length,
      0,
    );
    const avgLength = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // Calculate streaks
    const sortedDates = Array.from(
      new Set(entries.map((e) => e.date)),
    ).sort((a, b) => b.localeCompare(a));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sortedDates.length > 0) {
      // Check current streak from today/yesterday
      const firstDate = new Date(sortedDates[0]! + "T00:00:00");
      const daysDiff = Math.floor(
        (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1]! + "T00:00:00");
          const curr = new Date(sortedDates[i]! + "T00:00:00");
          const gap = Math.floor(
            (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (gap === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Longest streak
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]! + "T00:00:00");
        const curr = new Date(sortedDates[i]! + "T00:00:00");
        const gap = Math.floor(
          (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (gap === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // Mood distribution for last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = entries.filter(
      (e) => new Date(e.date + "T00:00:00") >= thirtyDaysAgo,
    );

    const moodDistribution: Record<Mood, number> = {
      great: 0,
      good: 0,
      okay: 0,
      meh: 0,
      bad: 0,
    };
    for (const e of recentEntries) {
      moodDistribution[e.mood]++;
    }

    // Mood trend (last 30 days, one point per day that has an entry)
    const moodTrend: { date: string; value: number }[] = [];
    const moodValues: Record<Mood, number> = {
      great: 5,
      good: 4,
      okay: 3,
      meh: 2,
      bad: 1,
    };

    const dateMap = new Map<string, Mood[]>();
    for (const e of recentEntries) {
      const existing = dateMap.get(e.date) ?? [];
      existing.push(e.mood);
      dateMap.set(e.date, existing);
    }

    const sortedTrendDates = Array.from(dateMap.keys()).sort();
    for (const d of sortedTrendDates) {
      const moods = dateMap.get(d)!;
      const avg =
        moods.reduce((s, m) => s + moodValues[m], 0) / moods.length;
      moodTrend.push({ date: d, value: avg });
    }

    return {
      totalEntries,
      totalWords,
      avgLength,
      currentStreak,
      longestStreak,
      moodDistribution,
      moodTrend,
    };
  }, [entries]);

  return {
    entries,
    filteredEntries,
    allTags,
    stats,
    searchQuery,
    setSearchQuery,
    tagFilter,
    setTagFilter,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleExport,
    handleImport,
  };
}
