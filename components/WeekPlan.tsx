"use client";

import { useState } from "react";
import { PROGRAM, CATEGORY_META } from "@/lib/program";
import { emptyWeek, useStore } from "@/lib/store";
import {
  formatWeekRange,
  weekStartISO,
  addWeeks,
  currentDayIndex,
  formatDay,
  dayISOForWeek,
} from "@/lib/date";
import { IconCheck, IconChevron } from "./icons";

export function WeekPlan({
  weekStart,
  setWeekStart,
}: {
  weekStart: string;
  setWeekStart: (s: string) => void;
}) {
  const { week, mutate } = useStore();
  const w = week(weekStart);
  const todayIdx = currentDayIndex(weekStart);
  const isThisWeek = weekStart === weekStartISO();
  const [open, setOpen] = useState<number>(todayIdx >= 0 ? todayIdx : 0);

  const toggle = (dayKey: string, i: number) => {
    const key = `${dayKey}-${i}`;
    const turningOn = !w.done[key];
    mutate((d) => {
      const cur = d.weeks[weekStart] ?? emptyWeek();
      cur.done = { ...cur.done, [key]: !cur.done[key] };
      d.weeks[weekStart] = cur;
    }, turningOn);
  };

  return (
    <div className="space-y-4">
      {/* Hafta navigasyonu */}
      <div className="card flex items-center justify-between px-2 py-2">
        <button
          onClick={() => setWeekStart(addWeeks(weekStart, -1))}
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-paper-sunk active:scale-95"
          aria-label="Önceki hafta"
        >
          <IconChevron className="h-5 w-5 rotate-180" />
        </button>
        <button
          onClick={() => setWeekStart(weekStartISO())}
          className="flex flex-col items-center px-3"
        >
          <span className="font-display text-[17px] text-ink">
            {formatWeekRange(weekStart)}
          </span>
          <span className="text-[11.5px] font-medium text-ink-faint">
            {isThisWeek ? "bu hafta" : "haftaya dön ↺"}
          </span>
        </button>
        <button
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-paper-sunk active:scale-95"
          aria-label="Sonraki hafta"
        >
          <IconChevron className="h-5 w-5" />
        </button>
      </div>

      {/* Günler */}
      <div className="space-y-2.5">
        {PROGRAM.map((day, di) => {
          const doneN = day.blocks.filter((_, i) => w.done[`${day.key}-${i}`]).length;
          const all = doneN === day.blocks.length;
          const isToday = di === todayIdx;
          const isOpen = open === di;
          return (
            <section
              key={day.key}
              className={`card overflow-hidden transition-shadow ${
                isToday ? "ring-2 ring-lav-300 shadow-lift" : ""
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : di)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-bold ${
                    all
                      ? "bg-sage-500 text-white"
                      : isToday
                      ? "bg-lav-500 text-white"
                      : "bg-paper-sunk text-ink-soft"
                  }`}
                >
                  {all ? <IconCheck className="h-5 w-5" /> : day.short}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[16.5px] text-ink">{day.label}</span>
                    {isToday && (
                      <span className="chip bg-lav-100 text-lav-700">Bugün</span>
                    )}
                  </div>
                  <span className="text-[12px] text-ink-faint">
                    {formatDay(dayISOForWeek(weekStart, di))} · {doneN}/{day.blocks.length} blok
                  </span>
                </div>
                {/* mini ilerleme noktaları */}
                <div className="mr-1 flex gap-1">
                  {day.blocks.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        w.done[`${day.key}-${i}`] ? "bg-sage-500" : "bg-lav-100"
                      }`}
                    />
                  ))}
                </div>
                <IconChevron
                  className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <ul className="space-y-1 px-2.5 pb-3 pt-0.5 animate-fade-up md:grid md:grid-cols-2 md:gap-1 md:space-y-0">
                  {day.blocks.map((b, i) => {
                    const checked = !!w.done[`${day.key}-${i}`];
                    const meta = CATEGORY_META[b.category];
                    return (
                      <li key={i}>
                        <button
                          onClick={() => toggle(day.key, i)}
                          className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors active:scale-[0.99] ${
                            checked ? "bg-sage-100/60" : "hover:bg-paper-sunk"
                          }`}
                        >
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all ${
                              checked
                                ? "border-sage-500 bg-sage-500 text-white"
                                : "border-line bg-paper-card"
                            }`}
                          >
                            {checked && <IconCheck className="check-draw h-4 w-4" />}
                          </span>
                          <span
                            className={`flex-1 text-[14.5px] leading-snug transition-colors ${
                              checked
                                ? "text-ink-faint line-through"
                                : "text-ink-soft"
                            }`}
                          >
                            {b.title}
                          </span>
                          <span className={`chip shrink-0 ${meta.chipBg} ${meta.chipText}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {b.tag}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <p className="px-1 pb-1 text-center text-[12px] text-ink-faint">
        Her bloğu 45–60 dk (vaktine göre 60–75 dk) planlayabilirsin.
      </p>
    </div>
  );
}
