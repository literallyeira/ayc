"use client";

import { WEEKLY_TARGETS } from "@/lib/program";
import { emptyWeek, useStore } from "@/lib/store";
import { formatWeekRange } from "@/lib/date";
import { AutoField } from "./fields";
import type { WeekData } from "@/lib/types";

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between px-1">
      <h2 className="font-display text-[18px] text-ink">{children}</h2>
      {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
    </div>
  );
}

export function GoalsTab({ weekStart }: { weekStart: string }) {
  const { week, mutate } = useStore();
  const w = week(weekStart);

  const upWeek = (fn: (cur: WeekData) => void) =>
    mutate((d) => {
      const cur = d.weeks[weekStart] ?? emptyWeek();
      fn(cur);
      d.weeks[weekStart] = cur;
    });

  const setGoal = (k: keyof WeekData["goals"], v: string) =>
    upWeek((cur) => (cur.goals = { ...cur.goals, [k]: v }));
  const setRoutine = (k: keyof WeekData["routine"], v: string) =>
    upWeek((cur) => (cur.routine = { ...cur.routine, [k]: v }));
  const setTarget = (key: string, field: "actual" | "note", v: string) =>
    upWeek((cur) => {
      const t = cur.targets[key] ?? { actual: "", note: "" };
      cur.targets = { ...cur.targets, [key]: { ...t, [field]: v } };
    });

  const goalRow = (label: string, k: keyof WeekData["goals"], ph: string) => (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">{label}</span>
      <AutoField value={w.goals[k]} onChange={(v) => setGoal(k, v)} placeholder={ph} />
    </label>
  );

  return (
    <div className="space-y-7">
      <p className="px-1 text-[12.5px] text-ink-faint">
        {formatWeekRange(weekStart)} için hedeflerin
      </p>

      {/* Haftalık hedefler */}
      <section>
        <SectionTitle hint="TYT">Bu haftanın hedefleri</SectionTitle>
        <div className="card space-y-3.5 p-4">
          {goalRow("Türkçe", "tytTurkce", "örn. paragraf hızı + 2 konu")}
          {goalRow("Matematik", "tytMatematik", "örn. fonksiyonlar + problem")}
          {goalRow("Fen", "tytFen", "örn. fizik 2 konu, kimya tekrar")}
          {goalRow("Sosyal", "tytSosyal", "örn. tarih 3 konu")}
        </div>
        <div className="card mt-3 space-y-3.5 p-4">
          <div className="mb-1 -mt-1 text-[12px] font-semibold uppercase tracking-wide text-blush-500">
            YDT
          </div>
          {goalRow("Kelime hedefi", "ydtKelime", "örn. 200 yeni kelime")}
          {goalRow("Reading hedefi", "ydtReading", "örn. 8 parça")}
          {goalRow("Grammar hedefi", "ydtGrammar", "örn. tenses tekrarı")}
        </div>
      </section>

      {/* Günlük rutin */}
      <section>
        <SectionTitle hint="her gün">Günlük rutin</SectionTitle>
        <div className="card grid grid-cols-2 gap-3 p-4">
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">Kelime (yeni)</span>
            <AutoField inputMode="numeric" value={w.routine.kelimeYeni} onChange={(v) => setRoutine("kelimeYeni", v)} placeholder="0" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">Kelime (tekrar)</span>
            <AutoField inputMode="numeric" value={w.routine.kelimeTekrar} onChange={(v) => setRoutine("kelimeTekrar", v)} placeholder="0" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">Reading (parça)</span>
            <AutoField inputMode="numeric" value={w.routine.reading} onChange={(v) => setRoutine("reading", v)} placeholder="0" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">Paragraf (adet)</span>
            <AutoField inputMode="numeric" value={w.routine.paragraf} onChange={(v) => setRoutine("paragraf", v)} placeholder="0" />
          </label>
        </div>
      </section>

      {/* Haftalık minimum hedefler */}
      <section>
        <SectionTitle hint="takip">Haftalık minimum hedefler</SectionTitle>
        <div className="card divide-y divide-line overflow-hidden">
          {WEEKLY_TARGETS.map((t) => {
            const cur = w.targets[t.key] ?? { actual: "", note: "" };
            return (
              <div key={t.key} className="flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-ink">{t.label}</div>
                  <div className="mt-0.5">
                    <span className="chip bg-lav-100 text-lav-700">hedef · {t.target}</span>
                  </div>
                </div>
                <div className="w-20 shrink-0">
                  <AutoField
                    inputMode="numeric"
                    className="text-center"
                    value={cur.actual}
                    onChange={(v) => setTarget(t.key, "actual", v)}
                    placeholder="—"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-[12px] text-ink-faint">
          Sağdaki kutuya bu hafta gerçekleşen sayını yaz.
        </p>
      </section>
    </div>
  );
}
