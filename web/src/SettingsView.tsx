import { useRef } from "react";

interface SettingsViewProps {
  onExport: () => void;
  onImport: (json: string) => void;
  entryCount: number;
}

export default function SettingsView({
  onExport,
  onImport,
  entryCount,
}: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result;
        if (typeof text !== "string") return;
        onImport(text);
        alert("Import successful!");
      } catch (err) {
        alert("Import failed: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Data Management
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          All your journal data is stored locally in this browser.{" "}
          {entryCount > 0
            ? `You have ${entryCount} ${entryCount === 1 ? "entry" : "entries"}.`
            : "No entries yet."}
        </p>
      </div>

      {/* Export */}
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: "var(--line)" }}
      >
        <h4 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Export Entries
        </h4>
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          Download all entries as a JSON file for backup or transfer.
        </p>
        <button
          onClick={onExport}
          disabled={entryCount === 0}
          className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          Download JSON
        </button>
      </div>

      {/* Import */}
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: "var(--line)" }}
      >
        <h4 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Import Entries
        </h4>
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          Replace all entries with data from a previously exported JSON file.
          This will overwrite your current data.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            borderColor: "var(--line)",
            color: "var(--ink)",
            background: "var(--panel)",
          }}
        >
          Choose File
        </button>
      </div>

      {/* About */}
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: "var(--line)" }}
      >
        <h4 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          About Journal
        </h4>
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          A simple, private daily journal. All data stays on your device.
          <br />
          Built for FreeAppStore. Open source under MIT license.
        </p>
      </div>
    </div>
  );
}
