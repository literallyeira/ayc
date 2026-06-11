"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useStore } from "@/lib/store";
import { todayISO, formatDay } from "@/lib/date";
import { AutoField, AutoArea } from "./fields";
import { IconPlus, IconTrash, IconChart } from "./icons";
import type { Exam } from "@/lib/types";

function parseNet(s: string): number | null {
  const m = s.replace(",", ".").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

export function ExamsTab() {
  const { state, mutate } = useStore();
  const exams = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));

  const addExam = () =>
    mutate((d) => {
      const ex: Exam = {
        id: crypto.randomUUID(),
        date: todayISO(),
        type: "TYT",
        name: "",
        net: "",
        topError: "",
        plan: "",
      };
      d.exams = [...d.exams, ex];
    }, true);

  const upExam = (id: string, field: keyof Exam, v: string) =>
    mutate((d) => {
      d.exams = d.exams.map((e) => (e.id === id ? { ...e, [field]: v } : e));
    });

  const delExam = (id: string) =>
    mutate((d) => {
      d.exams = d.exams.filter((e) => e.id !== id);
      // cihazlar arası birleştirmede geri dirilmesin
      d.removed = { ...(d.removed ?? {}), [`exam:${id}`]: Date.now() };
    });

  // Grafik verisi
  const chartData = exams
    .map((e) => ({
      date: formatDay(e.date),
      raw: e.date,
      [e.type]: parseNet(e.net),
    }))
    .filter((d) => d.TYT != null || d.YDT != null);

  const hasChart = chartData.length >= 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-[20px] text-ink">Denemeler & analiz</h2>
        <button
          onClick={addExam}
          className="inline-flex items-center gap-1.5 rounded-full bg-lav-500 px-3.5 py-2 text-[13px] font-semibold text-white shadow-soft transition-transform active:scale-95"
        >
          <IconPlus className="h-4 w-4" /> Ekle
        </button>
      </div>

      {/* Net grafiği */}
      {hasChart ? (
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink-soft">
            <IconChart className="h-4 w-4 text-lav-500" /> Net gelişimi
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#ebe8f5" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#827e98" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#827e98" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #ebe8f5",
                    boxShadow: "0 8px 24px -12px rgba(98,80,184,0.3)",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="TYT" stroke="#8b78ec" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="YDT" stroke="#e87fa0" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-5 text-[12px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-lav-500" /> TYT</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blush-500" /> YDT</span>
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-1.5 px-4 py-7 text-center">
          <IconChart className="h-6 w-6 text-lav-300" />
          <p className="text-[13px] text-ink-muted">
            En az 2 deneme girince net gelişim grafiği burada belirir.
          </p>
        </div>
      )}

      {/* Deneme listesi */}
      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
        {exams.length === 0 && (
          <p className="px-1 text-[13px] text-ink-faint">
            Henüz deneme yok. “Ekle” ile ilk denemeni kaydet.
          </p>
        )}
        {exams.map((e) => (
          <div key={e.id} className="card space-y-3 p-4">
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-line">
                {(["TYT", "YDT"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => upExam(e.id, "type", t)}
                    className={`px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      e.type === t
                        ? t === "TYT"
                          ? "bg-lav-500 text-white"
                          : "bg-blush-500 text-white"
                        : "bg-paper-card text-ink-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={e.date}
                onChange={(ev) => upExam(e.id, "date", ev.target.value)}
                className="field flex-1 py-1.5 text-[13px]"
              />
              <button
                onClick={() => delExam(e.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-blush-100 hover:text-blush-500"
                aria-label="Sil"
              >
                <IconTrash className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <AutoField value={e.name} onChange={(v) => upExam(e.id, "name", v)} placeholder="Deneme adı" />
              <AutoField value={e.net} onChange={(v) => upExam(e.id, "net", v)} placeholder="Net / puan" inputMode="decimal" />
            </div>
            <AutoArea value={e.topError} onChange={(v) => upExam(e.id, "topError", v)} placeholder="En çok hata yaptığın konular" rows={2} />
            <AutoArea value={e.plan} onChange={(v) => upExam(e.id, "plan", v)} placeholder="Düzeltme planı" rows={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
