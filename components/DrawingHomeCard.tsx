"use client";

import { useStore } from "@/lib/store";
import { todayISO, formatDay } from "@/lib/date";
import { IconBrush, IconChevron } from "./icons";

export function DrawingHomeCard({ onOpen }: { onOpen: () => void }) {
  const { drawings } = useStore();
  const today = todayISO();
  const dates = Object.keys(drawings).filter((d) => drawings[d]).sort((a, b) => b.localeCompare(a));
  const shown = drawings[today] ? today : dates[0];
  const url = shown ? drawings[shown] : "";

  return (
    <button
      onClick={onOpen}
      className="card flex w-full items-center gap-3.5 p-3 text-left transition-shadow hover:shadow-lift active:scale-[0.995]"
    >
      <div className="grid h-16 w-[88px] shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white">
        {url ? (
          <img src={url} alt="çizim" className="h-full w-full object-cover" />
        ) : (
          <IconBrush className="h-6 w-6 text-lav-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[16px] text-ink">
          {url ? (shown === today ? "Bugünün çizimi" : "Son çizim") : "Bugün bir şey çiz"}
        </div>
        <div className="text-[12.5px] text-ink-faint">
          {url
            ? shown === today
              ? "düzenlemek için dokun"
              : `${formatDay(shown!)} · yeni bir tane çiz`
            : "küçük bir karalama, güne renk kat ✏️"}
        </div>
      </div>
      <IconChevron className="h-4 w-4 shrink-0 text-ink-faint" />
    </button>
  );
}
