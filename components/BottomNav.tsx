"use client";

import { IconCalendar, IconTarget, IconChart, IconBook, IconBrush, IconFilm, IconMusic } from "./icons";

export type TabKey =
  | "hafta"
  | "hedefler"
  | "denemeler"
  | "gunluk"
  | "cizim"
  | "filmler"
  | "muzik";

const TABS: { key: TabKey; label: string; Icon: typeof IconCalendar }[] = [
  { key: "hafta", label: "Hafta", Icon: IconCalendar },
  { key: "hedefler", label: "Hedef", Icon: IconTarget },
  { key: "denemeler", label: "Deneme", Icon: IconChart },
  { key: "gunluk", label: "Günlük", Icon: IconBook },
  { key: "cizim", label: "Çizim", Icon: IconBrush },
  { key: "filmler", label: "Film", Icon: IconFilm },
  { key: "muzik", label: "Müzik", Icon: IconMusic },
];

export function BottomNav({
  tab,
  setTab,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper-card/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[560px] items-stretch justify-around px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:max-w-[760px]">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="group flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              <span
                className={`grid h-7 w-10 place-items-center rounded-full transition-all ${
                  active ? "bg-lav-100 text-lav-700" : "text-ink-faint group-active:scale-90"
                }`}
              >
                <Icon className="h-[20px] w-[20px]" />
              </span>
              <span
                className={`text-[9.5px] font-medium leading-none transition-colors ${
                  active ? "text-lav-700" : "text-ink-faint"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
