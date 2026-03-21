/**
 * SeekerBadge — shows the seeker's current level as a pill.
 * LevelSelector — inline dropdown to manually change level (for prototype/testing).
 */
import { useState, useEffect } from "react";
import { store, subscribe, LEVELS, type SeekerLevel } from "@/lib/localStore";

const LEVEL_COLORS: Record<SeekerLevel, string> = {
  jijnasu:   "bg-amber-100   text-amber-800   border-amber-300   dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  sadhaka:   "bg-orange-100  text-orange-800  border-orange-300  dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
  mumukshu:  "bg-primary/10  text-primary     border-primary/30",
};

/** Compact pill — for sidebar or page headers */
export function SeekerBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const [level, setLevel] = useState(store.getLevel());
  useEffect(() => subscribe(() => setLevel(store.getLevel())), []);
  const info = LEVELS.find(l => l.id === level)!;

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-medium leading-none ${LEVEL_COLORS[level]} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
      title={info.description}
    >
      <span>{size === "sm" ? info.roman : `${info.label} · ${info.roman}`}</span>
    </span>
  );
}

/** Full-width level card with description — for Home / Assessment pages */
export function LevelCard() {
  const [level, setLevel] = useState(store.getLevel());
  useEffect(() => subscribe(() => setLevel(store.getLevel())), []);
  const info = LEVELS.find(l => l.id === level)!;
  const idx = LEVELS.findIndex(l => l.id === level);

  return (
    <div className={`rounded-xl border px-4 py-3 ${LEVEL_COLORS[level]}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-serif text-base font-bold">{info.label}</span>
          <span className="text-xs opacity-70">({info.roman})</span>
        </div>
        {/* Level progress dots */}
        <div className="flex gap-1.5">
          {LEVELS.map((l, i) => (
            <span
              key={l.id}
              className={`w-2 h-2 rounded-full ${i <= idx ? "bg-current" : "bg-current opacity-20"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-xs opacity-80 leading-relaxed">{info.description}</p>
      {idx < LEVELS.length - 1 && (
        <p className="text-[10px] opacity-60 mt-1.5">
          Next: {LEVELS[idx + 1].roman} · Take an assessment to advance
        </p>
      )}
    </div>
  );
}

/** Inline level switcher — visible on all level-aware pages so user can preview other levels */
export function LevelFilter({
  value,
  onChange,
  label = "Showing content for:",
}: {
  value: SeekerLevel | "all";
  onChange: (v: SeekerLevel | "all") => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">{label}</span>
      {(["all", ...LEVELS.map(l => l.id)] as (SeekerLevel | "all")[]).map(id => {
        const info = id === "all" ? null : LEVELS.find(l => l.id === id)!;
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {id === "all" ? "All levels" : info!.roman}
          </button>
        );
      })}
    </div>
  );
}
