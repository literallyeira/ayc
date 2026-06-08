"use client";

import { useState } from "react";
import { emptyWeek, useStore } from "@/lib/store";
import { AutoArea } from "./fields";
import { IconChevron } from "./icons";
import type { WeekData } from "@/lib/types";

export function EvaluationCard({ weekStart }: { weekStart: string }) {
  const { week, mutate } = useStore();
  const w = week(weekStart);
  const [open, setOpen] = useState(false);

  const set = (k: keyof WeekData["evaluation"], v: string) =>
    mutate((d) => {
      const cur = d.weeks[weekStart] ?? emptyWeek();
      cur.evaluation = { ...cur.evaluation, [k]: v };
      d.weeks[weekStart] = cur;
    });

  const filled = Object.values(w.evaluation).filter((x) => x.trim()).length;

  const row = (label: string, k: keyof WeekData["evaluation"], ph: string) => (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">{label}</span>
      <AutoArea value={w.evaluation[k]} onChange={(v) => set(k, v)} placeholder={ph} rows={2} />
    </label>
  );

  return (
    <section className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-xl">🌙</span>
        <div className="flex-1">
          <div className="font-display text-[16.5px] text-ink">Haftalık değerlendirme</div>
          <div className="text-[12px] text-ink-faint">
            Pazar günü doldur · {filled}/4
          </div>
        </div>
        <IconChevron className={`h-4 w-4 text-ink-faint transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3.5 px-4 pb-4 pt-0.5 animate-fade-up">
          {row("Bu hafta en iyi giden", "enIyi", "neyi iyi yaptın?")}
          {row("En çok zorlayan", "enZorlayan", "nerede takıldın?")}
          {row("Netleri artıran hamle", "netHamle", "işe yarayan şey neydi?")}
          {row("Gelecek hafta 1 ana odak", "gelecekOdak", "tek bir net odak")}
        </div>
      )}
    </section>
  );
}
