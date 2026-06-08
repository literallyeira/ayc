"use client";

import { useStore } from "@/lib/store";
import { todayISO, formatDay } from "@/lib/date";
import { CONFIG } from "@/lib/config";
import { AutoArea } from "./fields";
import { IconSpark } from "./icons";
import type { JournalEntry } from "@/lib/types";

const MOODS = [
  { v: 1, e: "😖", label: "zor" },
  { v: 2, e: "😕", label: "yorgun" },
  { v: 3, e: "😌", label: "idare" },
  { v: 4, e: "🙂", label: "iyi" },
  { v: 5, e: "🤩", label: "harika" },
];

function dailyMotivation(): string {
  const list = CONFIG.motivations;
  if (list.length === 0) return "";
  const d = new Date();
  const idx =
    (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % list.length;
  return list[idx];
}

export function JournalTab() {
  const { state, mutate } = useStore();
  const today = todayISO();
  const entry: JournalEntry = state.journal[today] ?? { note: "", mood: 0 };

  const setEntry = (patch: Partial<JournalEntry>, touch = false) =>
    mutate((d) => {
      const cur = d.journal[today] ?? { note: "", mood: 0 };
      d.journal = { ...d.journal, [today]: { ...cur, ...patch } };
    }, touch);

  const past = Object.entries(state.journal)
    .filter(([date, e]) => date !== today && (e.note.trim() || e.mood))
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 14);

  return (
    <div className="space-y-6">
      {/* Motivasyon */}
      <div className="card relative overflow-hidden bg-gradient-to-br from-lav-500 to-lav-600 p-5 text-white shadow-lift">
        <IconSpark className="absolute -right-3 -top-3 h-20 w-20 text-white/15" />
        <div className="relative">
          <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-white/70">
            Bugün için
          </div>
          <p className="font-display text-[19px] leading-snug">
            {dailyMotivation()}
          </p>
        </div>
      </div>

      {/* Bugünün günlüğü */}
      <section>
        <div className="mb-2.5 flex items-baseline justify-between px-1">
          <h2 className="font-display text-[18px] text-ink">Bugün nasıl geçti?</h2>
          <span className="text-[12px] text-ink-faint">{formatDay(today)}</span>
        </div>
        <div className="card space-y-4 p-4">
          <div className="flex justify-between gap-1.5">
            {MOODS.map((m) => {
              const active = entry.mood === m.v;
              return (
                <button
                  key={m.v}
                  onClick={() => setEntry({ mood: active ? 0 : m.v }, true)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 transition-all active:scale-95 ${
                    active ? "bg-lav-100 ring-2 ring-lav-300" : "hover:bg-paper-sunk"
                  }`}
                >
                  <span className={`text-2xl transition-transform ${active ? "scale-110" : "grayscale-[35%]"}`}>
                    {m.e}
                  </span>
                  <span className={`text-[10.5px] font-medium ${active ? "text-lav-700" : "text-ink-faint"}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
          <AutoArea
            value={entry.note}
            onChange={(v) => setEntry({ note: v })}
            placeholder="Aklındakileri yaz: neyi başardın, neye takıldın, yarın için aklında ne var…"
            rows={5}
          />
        </div>
      </section>

      {/* Geçmiş */}
      {past.length > 0 && (
        <section>
          <h2 className="mb-2.5 px-1 font-display text-[18px] text-ink">Geçmiş notlar</h2>
          <div className="space-y-2.5">
            {past.map(([date, e]) => (
              <div key={date} className="card flex gap-3 p-3.5">
                <div className="shrink-0 text-2xl leading-none">
                  {MOODS.find((m) => m.v === e.mood)?.e ?? "·"}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-ink-faint">{formatDay(date)}</div>
                  {e.note.trim() && (
                    <p className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-snug text-ink-soft">
                      {e.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
