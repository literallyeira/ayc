"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { PROGRAM } from "@/lib/program";
import { weekStartISO, computeStreak } from "@/lib/date";
import { Header } from "@/components/Header";
import { WeekPlan } from "@/components/WeekPlan";
import { GoalsTab } from "@/components/GoalsTab";
import { ExamsTab } from "@/components/ExamsTab";
import { JournalTab } from "@/components/JournalTab";
import { DrawCanvas } from "@/components/DrawCanvas";
import { DrawingHomeCard } from "@/components/DrawingHomeCard";
import { MoviesTab } from "@/components/MoviesTab";
import { SpotifyTab } from "@/components/SpotifyTab";
import { completeAuthFromUrl } from "@/lib/spotify";
import { EvaluationCard } from "@/components/EvaluationCard";
import { Pomodoro } from "@/components/Pomodoro";
import { BottomNav, type TabKey } from "@/components/BottomNav";

const TOTAL_BLOCKS = PROGRAM.reduce((n, d) => n + d.blocks.length, 0);

function App() {
  const { state, ready, week, cloud, sync, mutate } = useStore();
  const [tab, setTab] = useState<TabKey>("hafta");
  const [weekStart, setWeekStart] = useState<string>(() => weekStartISO());

  // Spotify yetkilendirmesinden dönüş (?code=...) yakala
  useEffect(() => {
    completeAuthFromUrl()
      .then((res) => {
        if (res) {
          mutate((d) => (d.spotify = res));
          setTab("muzik");
        }
      })
      .catch(() => {});
  }, [mutate]);

  const { doneCount, progress } = useMemo(() => {
    const w = week(weekStart);
    let done = 0;
    PROGRAM.forEach((day) => {
      day.blocks.forEach((_, i) => {
        if (w.done[`${day.key}-${i}`]) done++;
      });
    });
    return { doneCount: done, progress: done / TOTAL_BLOCKS };
  }, [week, weekStart, state]);

  const streak = useMemo(() => computeStreak(state.activity), [state.activity]);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3 text-ink-faint">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-lav-200 border-t-lav-500" />
          <span className="text-[13px]">Yükleniyor…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[560px] md:max-w-[760px]">
      <Header
        streak={streak}
        progress={progress}
        doneCount={doneCount}
        total={TOTAL_BLOCKS}
        cloud={cloud}
        sync={sync}
      />

      <main className="px-5 pb-28 pt-1 md:px-8">
        <div key={tab} className="animate-fade-up">
          {tab === "hafta" && (
            <div className="space-y-4">
              <DrawingHomeCard onOpen={() => setTab("cizim")} />
              <WeekPlan weekStart={weekStart} setWeekStart={setWeekStart} />
              <EvaluationCard weekStart={weekStart} />
            </div>
          )}
          {tab === "hedefler" && <GoalsTab weekStart={weekStart} />}
          {tab === "denemeler" && <ExamsTab />}
          {tab === "gunluk" && <JournalTab />}
          {tab === "cizim" && <DrawCanvas />}
          {tab === "filmler" && <MoviesTab />}
          {tab === "muzik" && <SpotifyTab />}
        </div>
      </main>

      <Pomodoro />
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}
