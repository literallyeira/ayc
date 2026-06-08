"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { todayISO, addDays, formatDay } from "@/lib/date";
import {
  IconChevron,
  IconUndo,
  IconEraser,
  IconReset,
  IconBrush,
} from "./icons";

const W = 900;
const H = 680;

const COLORS = [
  "#26233a",
  "#8b78ec",
  "#6450b8",
  "#e87fa0",
  "#e8542f",
  "#f5a623",
  "#56b08a",
  "#3a9bd5",
  "#9b59b6",
  "#7a5230",
];
const SIZES = [3, 6, 11, 20];

export function DrawCanvas() {
  const { drawings, setDrawing } = useStore();
  const [date, setDate] = useState<string>(() => todayISO());
  const [color, setColor] = useState("#8b78ec");
  const [size, setSize] = useState(6);
  const [eraser, setEraser] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const undoRef = useRef<ImageData[]>([]);
  const renderedRef = useRef<string>(""); // ekrandaki çizimin kaynağı (kendi kaydımızı es geçmek için)
  const [canUndo, setCanUndo] = useState(false);

  const isToday = date === todayISO();

  const fillWhite = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
  };

  // canvas hazırlığı
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    fillWhite(ctx);
  }, []);

  // tarih / uzaktan değişimde yükle
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const url = drawings[date] ?? "";
    if (url === renderedRef.current) return; // kendi kaydımız → dokunma
    undoRef.current = [];
    setCanUndo(false);
    if (!url) {
      fillWhite(ctx);
      renderedRef.current = "";
      return;
    }
    const img = new Image();
    img.onload = () => {
      fillWhite(ctx);
      ctx.drawImage(img, 0, 0, W, H);
    };
    img.src = url;
    renderedRef.current = url;
  }, [date, drawings]);

  const pos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  };

  const pressureWidth = (p: number) => {
    const pr = p > 0 && p < 1 ? p : 0.5;
    return Math.max(1, size * (0.35 + pr * 1.3));
  };

  const onDown = (e: React.PointerEvent) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    // geri al için anlık görüntü
    undoRef.current.push(ctx.getImageData(0, 0, W, H));
    if (undoRef.current.length > 12) undoRef.current.shift();
    setCanUndo(true);

    drawingRef.current = true;
    const p = pos(e);
    lastRef.current = p;
    const w = pressureWidth(e.pressure);
    ctx.fillStyle = eraser ? "#ffffff" : color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, w / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    const ctx = ctxRef.current;
    const last = lastRef.current;
    if (!ctx || !last) return;
    // birden çok ara nokta (akıcılık) — coalesced events
    const events =
      (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [e.nativeEvent];
    ctx.strokeStyle = eraser ? "#ffffff" : color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let lx = last.x;
    let ly = last.y;
    for (const ev of events as PointerEvent[]) {
      const r = canvasRef.current!.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * W;
      const y = ((ev.clientY - r.top) / r.height) * H;
      ctx.lineWidth = pressureWidth(ev.pressure);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(x, y);
      ctx.stroke();
      lx = x;
      ly = y;
    }
    lastRef.current = { x: lx, y: ly };
  };

  const commit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/jpeg", 0.82);
    renderedRef.current = url;
    setDrawing(date, url);
  }, [date, setDrawing]);

  const onUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    commit();
  };

  const undo = () => {
    const ctx = ctxRef.current;
    const snap = undoRef.current.pop();
    if (!ctx || !snap) return;
    ctx.putImageData(snap, 0, 0);
    setCanUndo(undoRef.current.length > 0);
    commit();
  };

  const clear = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    undoRef.current.push(ctx.getImageData(0, 0, W, H));
    setCanUndo(true);
    fillWhite(ctx);
    commit();
  };

  const past = Object.keys(drawings)
    .filter((d) => drawings[d])
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 14);

  return (
    <div className="space-y-4">
      {/* Tarih navigasyonu */}
      <div className="card flex items-center justify-between px-2 py-2">
        <button
          onClick={() => setDate(addDays(date, -1))}
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-paper-sunk active:scale-95"
          aria-label="Önceki gün"
        >
          <IconChevron className="h-5 w-5 rotate-180" />
        </button>
        <button onClick={() => setDate(todayISO())} className="flex flex-col items-center px-3">
          <span className="font-display text-[17px] text-ink">{formatDay(date)}</span>
          <span className="text-[11.5px] font-medium text-ink-faint">
            {isToday ? "bugün" : "bugüne dön ↺"}
          </span>
        </button>
        <button
          onClick={() => date < todayISO() && setDate(addDays(date, 1))}
          disabled={date >= todayISO()}
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-paper-sunk active:scale-95 disabled:opacity-30"
          aria-label="Sonraki gün"
        >
          <IconChevron className="h-5 w-5" />
        </button>
      </div>

      {/* Tuval */}
      <div className="card overflow-hidden p-2.5">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onPointerCancel={onUp}
          className="block w-full cursor-crosshair rounded-xl bg-white"
          style={{ aspectRatio: `${W} / ${H}`, touchAction: "none" }}
        />
      </div>

      {/* Renkler */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        {COLORS.map((c) => {
          const active = !eraser && color === c;
          return (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setEraser(false);
              }}
              className={`h-8 w-8 rounded-full transition-transform active:scale-90 ${
                active ? "ring-2 ring-offset-2 ring-ink/30 scale-110" : ""
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          );
        })}
      </div>

      {/* Araçlar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
                size === s ? "bg-lav-100" : "hover:bg-paper-sunk"
              }`}
              aria-label={`Fırça ${s}`}
            >
              <span
                className="rounded-full bg-ink"
                style={{ width: Math.max(4, s / 1.6), height: Math.max(4, s / 1.6) }}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEraser((v) => !v)}
            className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${
              eraser ? "bg-lav-500 text-white" : "bg-paper-sunk text-ink-soft hover:bg-line"
            }`}
            aria-label="Silgi"
          >
            <IconEraser className="h-5 w-5" />
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="grid h-10 w-10 place-items-center rounded-xl bg-paper-sunk text-ink-soft transition-colors hover:bg-line disabled:opacity-30"
            aria-label="Geri al"
          >
            <IconUndo className="h-5 w-5" />
          </button>
          <button
            onClick={clear}
            className="grid h-10 w-10 place-items-center rounded-xl bg-paper-sunk text-ink-soft transition-colors hover:bg-blush-100 hover:text-blush-500"
            aria-label="Temizle"
          >
            <IconReset className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="px-1 text-[12px] text-ink-faint">
        Kalemle bastıkça çizgi kalınlaşır. Her gün otomatik kaydedilir 💜
      </p>

      {/* Geçmiş çizimler */}
      {past.length > 0 && (
        <section className="pt-1">
          <div className="mb-2 flex items-center gap-2 px-1 text-[13px] font-medium text-ink-soft">
            <IconBrush className="h-4 w-4 text-lav-500" /> Geçmiş çizimler
          </div>
          <div className="flex gap-2.5 overflow-x-auto px-1 pb-1 no-scrollbar">
            {past.map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`shrink-0 overflow-hidden rounded-xl border bg-white transition-all ${
                  d === date ? "border-lav-400 ring-2 ring-lav-200" : "border-line"
                }`}
              >
                <img src={drawings[d]} alt={d} className="h-20 w-[107px] object-cover" />
                <div className="px-1 py-0.5 text-center text-[10.5px] text-ink-faint">
                  {formatDay(d)}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
