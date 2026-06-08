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
  const { state, week, mutate } = useStore();
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
  const setActual = (key: string, v: string) =>
    upWeek((cur) => {
      const t = cur.targets[key] ?? { actual: "", note: "" };
      cur.targets = { ...cur.targets, [key]: { ...t, actual: v } };
    });
  const setTargetDef = (key: string, v: string) =>
    mutate((d) => {
      d.targetDefs = { ...(d.targetDefs ?? {}), [key]: v };
    });

  const goalRow = (label: string, k: keyof WeekData["goals"], ph: string) => (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">{label}</span>
      <AutoField value={w.goals[k]} onChange={(v) => setGoal(k, v)} placeholder={ph} />
    </label>
  );

  const routineRow = (label: string, k: keyof WeekData["routine"]) => (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-medium text-ink-muted">{label}</span>
      <AutoField inputMode="numeric" value={w.routine[k]} onChange={(v) => setRoutine(k, v)} placeholder="0" />
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
        <div className="card grid gap-3.5 p-4 md:grid-cols-2">
          {goalRow("Türkçe", "tytTurkce", "örn. paragraf hızı + 2 konu")}
          {goalRow("Matematik", "tytMatematik", "örn. fonksiyonlar + problem")}
          {goalRow("Fen", "tytFen", "örn. fizik 2 konu, kimya tekrar")}
          {goalRow("Sosyal", "tytSosyal", "örn. tarih 3 konu")}
        </div>
        <div className="card mt-3 p-4">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-blush-500">
            YDT
          </div>
          <div className="grid gap-3.5 md:grid-cols-3">
            {goalRow("Kelime hedefi", "ydtKelime", "örn. 200 yeni kelime")}
            {goalRow("Reading hedefi", "ydtReading", "örn. 8 parça")}
            {goalRow("Grammar hedefi", "ydtGrammar", "örn. tenses tekrarı")}
          </div>
        </div>
      </section>

      {/* Günlük rutin */}
      <section>
        <SectionTitle hint="her gün">Günlük rutin</SectionTitle>
        <div className="card grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
          {routineRow("Kelime (yeni)", "kelimeYeni")}
          {routineRow("Kelime (tekrar)", "kelimeTekrar")}
          {routineRow("Reading (parça)", "reading")}
          {routineRow("Paragraf (adet)", "paragraf")}
        </div>
      </section>

      {/* Haftalık minimum hedefler — düzenlenebilir */}
      <section>
        <SectionTitle hint="düzenlenebilir">Haftalık minimum hedefler</SectionTitle>
        <div className="grid gap-2.5 md:grid-cols-2">
          {WEEKLY_TARGETS.map((t) => {
            const cur = w.targets[t.key] ?? { actual: "", note: "" };
            const targetVal = state.targetDefs?.[t.key] ?? t.target;
            return (
              <div key={t.key} className="card p-3.5">
                <div className="text-[14px] font-medium text-ink">{t.label}</div>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-lav-600">hedef</span>
                    <AutoField
                      value={targetVal}
                      onChange={(v) => setTargetDef(t.key, v)}
                      placeholder="örn. 150–200"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-sage-600">gerçekleşen</span>
                    <AutoField
                      inputMode="numeric"
                      value={cur.actual}
                      onChange={(v) => setActual(t.key, v)}
                      placeholder="—"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-[12px] text-ink-faint">
          Soldaki “hedef” değerini kendine göre düzenleyebilir, sağa bu hafta gerçekleşeni yazabilirsin.
        </p>
      </section>
    </div>
  );
}
