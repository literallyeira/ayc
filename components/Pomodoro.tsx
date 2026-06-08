"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { ProgressRing } from "./ProgressRing";
import { IconTimer, IconPlay, IconPause, IconReset, IconClose } from "./icons";

const FOCUS = [45, 50, 60];
const BREAK = 10;

export function Pomodoro() {
  const { mutate } = useStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [focusMin, setFocusMin] = useState(50);
  const [remaining, setRemaining] = useState(50 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = (mode === "focus" ? focusMin : BREAK) * 60;

  // mod / süre değişince sıfırla (çalışmıyorsa)
  useEffect(() => {
    if (!running) setRemaining(total);
  }, [mode, focusMin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (running) {
      tick.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            complete();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const complete = () => {
    setRunning(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([120, 60, 120]);
    if (mode === "focus") {
      setSessions((s) => s + 1);
      mutate(() => {}, true); // bugünü aktif işaretle
      setMode("break");
      setRemaining(BREAK * 60);
    } else {
      setMode("focus");
      setRemaining(focusMin * 60);
    }
  };

  const reset = () => {
    setRunning(false);
    setRemaining(total);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = 1 - remaining / total;

  return (
    <>
      {/* Yüzen buton */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[88px] right-4 z-30 grid place-items-center rounded-full bg-lav-500 text-white shadow-lift transition-transform active:scale-90"
        style={{ height: 52, width: 52 }}
        aria-label="Zamanlayıcı"
      >
        <IconTimer className="h-6 w-6" />
        {running && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-sage-500" />
          </span>
        )}
      </button>

      {/* Alt sayfa */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-[560px] animate-fade-up rounded-t-[28px] bg-paper-card p-6 pb-9 shadow-lift">
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-line" />
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-paper-sunk"
              aria-label="Kapat"
            >
              <IconClose className="h-5 w-5" />
            </button>

            <div className="mb-4 flex justify-center gap-2">
              {(["focus", "break"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                    mode === m ? "bg-lav-500 text-white" : "bg-paper-sunk text-ink-muted"
                  }`}
                >
                  {m === "focus" ? "Odak" : "Mola"}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing value={progress} size={200} stroke={12}>
                <div className="text-center">
                  <div className="font-display text-[44px] leading-none text-ink tabular-nums">
                    {mm}:{ss}
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-ink-faint">
                    {mode === "focus" ? "odaklanma" : "kısa mola"}
                  </div>
                </div>
              </ProgressRing>

              {mode === "focus" && !running && (
                <div className="mt-5 flex gap-2">
                  {FOCUS.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFocusMin(f);
                        setRemaining(f * 60);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                        focusMin === f ? "bg-lav-100 text-lav-700" : "text-ink-muted hover:bg-paper-sunk"
                      }`}
                    >
                      {f} dk
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={reset}
                  className="grid h-12 w-12 place-items-center rounded-full bg-paper-sunk text-ink-soft transition-transform active:scale-90"
                  aria-label="Sıfırla"
                >
                  <IconReset className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="grid h-16 w-16 place-items-center rounded-full bg-lav-500 text-white shadow-lift transition-transform active:scale-90"
                  aria-label={running ? "Duraklat" : "Başlat"}
                >
                  {running ? <IconPause className="h-7 w-7" /> : <IconPlay className="ml-0.5 h-7 w-7" />}
                </button>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-sage-100 text-[13px] font-bold text-sage-600">
                  {sessions}
                </div>
              </div>
              <p className="mt-4 text-center text-[12px] text-ink-faint">
                Bugün {sessions} odak bloğu tamamladın. Devam 💜
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
