"use client";

import { CONFIG } from "@/lib/config";
import { ProgressRing } from "./ProgressRing";
import { IconFlame } from "./icons";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

export function Header({
  streak,
  progress,
  doneCount,
  total,
  cloud,
  sync,
}: {
  streak: number;
  progress: number;
  doneCount: number;
  total: number;
  cloud: boolean;
  sync: "local" | "syncing" | "synced" | "error";
}) {
  const syncMeta = cloud
    ? {
        synced: { c: "bg-sage-500", t: "Senkron" },
        syncing: { c: "bg-lav-400 animate-pulse", t: "Kaydediliyor" },
        error: { c: "bg-blush-500", t: "Bağlantı yok" },
        local: { c: "bg-lav-300", t: "Yerel" },
      }[sync]
    : { c: "bg-lav-300", t: "Bu cihazda" };

  return (
    <header className="px-5 pt-7 pb-3 md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${syncMeta.c}`} />
              {syncMeta.t}
            </span>
          </div>
          <h1 className="mt-1 font-display text-[27px] leading-tight text-ink">
            {greeting()},{" "}
            <span className="italic text-lav-600">{CONFIG.name}</span>
          </h1>
          <p className="mt-1 max-w-[20rem] text-[13.5px] leading-snug text-ink-soft">
            {CONFIG.welcome}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          <ProgressRing value={progress} size={58} stroke={6}>
            <span className="text-[13px] font-semibold text-lav-700">
              {Math.round(progress * 100)}%
            </span>
          </ProgressRing>
          <div className="chip bg-amber-100 text-amber-600">
            <IconFlame className="h-3.5 w-3.5" />
            {streak} gün
          </div>
        </div>
      </div>
      <p className="mt-2 text-[12.5px] text-ink-faint">
        Bu hafta {doneCount}/{total} blok tamamlandı
      </p>
    </header>
  );
}
