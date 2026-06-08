"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AppState, WeekData, Exam, JournalEntry } from "./types";
import { todayISO } from "./date";
import { isCloud, loadRemote, saveRemote } from "./supabase";

const LS_KEY = "calisma-programi/state/v1";

export function emptyWeek(): WeekData {
  return {
    done: {},
    goals: {
      tytTurkce: "",
      tytMatematik: "",
      tytFen: "",
      tytSosyal: "",
      ydtKelime: "",
      ydtReading: "",
      ydtGrammar: "",
    },
    routine: { kelimeYeni: "", kelimeTekrar: "", reading: "", paragraf: "" },
    targets: {},
    evaluation: { enIyi: "", enZorlayan: "", netHamle: "", gelecekOdak: "" },
  };
}

function emptyState(): AppState {
  return {
    version: 1,
    updatedAt: Date.now(),
    weeks: {},
    targetDefs: {},
    exams: [],
    journal: {},
    activity: {},
  };
}

function loadLocal(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

function saveLocal(state: AppState) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* sessizce geç */
  }
}

type SyncStatus = "local" | "syncing" | "synced" | "error";

interface StoreCtx {
  state: AppState;
  ready: boolean;
  cloud: boolean;
  sync: SyncStatus;
  week: (weekStart: string) => WeekData;
  mutate: (fn: (draft: AppState) => void, touchToday?: boolean) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncStatus>(isCloud ? "syncing" : "local");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<AppState>(state);
  latest.current = state;

  // İlk yükleme: localStorage hızlı, sonra cloud (varsa) üstüne.
  useEffect(() => {
    let cancelled = false;
    const local = loadLocal();
    if (local) setState(local);
    setReady(true);

    (async () => {
      if (!isCloud) return;
      const remote = await loadRemote();
      if (cancelled) return;
      const localTs = local?.updatedAt ?? 0;
      if (remote && remote.updatedAt >= localTs) {
        setState(remote);
        saveLocal(remote);
        setSync("synced");
      } else if (local) {
        // yerel daha yeni → buluta gönder
        const ok = await saveRemote(local);
        setSync(ok ? "synced" : "error");
      } else {
        setSync("synced");
      }
    })().catch(() => setSync("error"));

    return () => {
      cancelled = true;
    };
  }, []);

  const pushRemote = useCallback((next: AppState) => {
    if (!isCloud) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSync("syncing");
    saveTimer.current = setTimeout(async () => {
      const ok = await saveRemote(latest.current);
      setSync(ok ? "synced" : "error");
    }, 700);
  }, []);

  const mutate = useCallback(
    (fn: (draft: AppState) => void, touchToday = false) => {
      setState((prev) => {
        const draft: AppState = structuredClone(prev);
        fn(draft);
        if (touchToday) draft.activity[todayISO()] = true;
        draft.updatedAt = Date.now();
        saveLocal(draft);
        pushRemote(draft);
        return draft;
      });
    },
    [pushRemote]
  );

  const week = useCallback(
    (weekStart: string): WeekData => state.weeks[weekStart] ?? emptyWeek(),
    [state]
  );

  // Sekmeye geri dönünce buluttan tazele
  useEffect(() => {
    if (!isCloud) return;
    const onFocus = async () => {
      const remote = await loadRemote();
      if (remote && remote.updatedAt > latest.current.updatedAt) {
        setState(remote);
        saveLocal(remote);
      }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onFocus();
    });
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  return (
    <Ctx.Provider value={{ state, ready, cloud: isCloud, sync, week, mutate }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Yardımcı tipler dışa
export type { Exam, JournalEntry };
