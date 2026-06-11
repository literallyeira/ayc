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
import {
  isCloud,
  loadRemote,
  saveRemote,
  saveRemoteKeepalive,
  loadRemoteDrawings,
  saveRemoteDrawings,
  type DrawingsDoc,
} from "./supabase";
import { mergeStates, mergeDrawings } from "./merge";

const LS_KEY = "calisma-programi/state/v1";
const DRAW_LS_KEY = "calisma-programi/drawings/v1";

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
    movies: [],
    persona: null,
    chat: [],
    spotify: null,
    journal: {},
    activity: {},
    removed: {},
    games: { snakeBest: 0 },
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

function emptyDrawings(): DrawingsDoc {
  return { updatedAt: 0, items: {} };
}

function loadLocalDrawings(): DrawingsDoc | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAW_LS_KEY);
    return raw ? (JSON.parse(raw) as DrawingsDoc) : null;
  } catch {
    return null;
  }
}

function saveLocalDrawings(doc: DrawingsDoc) {
  try {
    window.localStorage.setItem(DRAW_LS_KEY, JSON.stringify(doc));
  } catch {
    /* kota dolabilir; sessizce geç */
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
  drawings: Record<string, string>;
  setDrawing: (dateISO: string, dataUrl: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncStatus>(isCloud ? "syncing" : "local");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<AppState>(state);
  latest.current = state;

  // Çizimler (ayrı senkron kanalı)
  const [drawings, setDrawings] = useState<DrawingsDoc>(() => emptyDrawings());
  const drawLatest = useRef<DrawingsDoc>(drawings);
  drawLatest.current = drawings;
  const drawTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (remote) {
        // Eskiden "son yazan kazanır" ile belge bütün halinde değiştiriliyordu;
        // bu, iki cihaz arasında veri (film, günlük, işaret…) kaybettiriyordu.
        // Artık alan bazında birleştiriyoruz — kimsenin verisi ezilmez.
        const merged = mergeStates(latest.current, remote);
        setState(merged);
        saveLocal(merged);
        if (JSON.stringify(merged) !== JSON.stringify(remote)) {
          const ok = await saveRemote(merged);
          setSync(ok ? "synced" : "error");
        } else {
          setSync("synced");
        }
      } else {
        // bulutta hiç veri yok → yereldekini gönder
        const ok = await saveRemote(latest.current);
        setSync(ok ? "synced" : "error");
      }
    })().catch(() => setSync("error"));

    return () => {
      cancelled = true;
    };
  }, []);

  // Çizimleri yükle: yerel hızlı, sonra bulut.
  useEffect(() => {
    let cancelled = false;
    const local = loadLocalDrawings();
    if (local) setDrawings(local);
    (async () => {
      if (!isCloud) return;
      const remote = await loadRemoteDrawings();
      if (cancelled || !remote) return;
      const merged = mergeDrawings(drawLatest.current, remote);
      setDrawings(merged);
      saveLocalDrawings(merged);
      if (JSON.stringify(merged) !== JSON.stringify(remote)) {
        await saveRemoteDrawings(merged);
      }
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setDrawing = useCallback((dateISO: string, dataUrl: string) => {
    setDrawings((prev) => {
      const next: DrawingsDoc = {
        updatedAt: Date.now(),
        items: { ...prev.items, [dateISO]: dataUrl },
      };
      saveLocalDrawings(next);
      if (isCloud) {
        if (drawTimer.current) clearTimeout(drawTimer.current);
        setSync("syncing");
        drawTimer.current = setTimeout(async () => {
          const ok = await saveRemoteDrawings(drawLatest.current);
          setSync(ok ? "synced" : "error");
        }, 900);
      }
      return next;
    });
    // çizim yapmak da bugünü aktif sayar (streak) — günde bir kez
    if (!latest.current.activity[todayISO()]) {
      mutate(() => {}, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Sekmeye geri dönünce buluttan tazele (birleştirerek);
  // sekme gizlenirken / sayfa kapanırken bekleyen kaydı hemen gönder.
  useEffect(() => {
    if (!isCloud) return;

    const refresh = async () => {
      const remote = await loadRemote();
      if (remote) {
        const merged = mergeStates(latest.current, remote);
        if (JSON.stringify(merged) !== JSON.stringify(latest.current)) {
          setState(merged);
          saveLocal(merged);
        }
        if (JSON.stringify(merged) !== JSON.stringify(remote)) {
          saveRemote(merged).catch(() => {});
        }
      }
      const rd = await loadRemoteDrawings();
      if (rd) {
        const merged = mergeDrawings(drawLatest.current, rd);
        if (JSON.stringify(merged) !== JSON.stringify(drawLatest.current)) {
          setDrawings(merged);
          saveLocalDrawings(merged);
        }
      }
    };

    // Debounce bekleyen kayıt varsa kaçırma: telefonda ekleyip hemen
    // uygulamadan çıkınca buluta hiç yazılmıyordu.
    const flush = () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
        saveRemoteKeepalive(latest.current);
        setSync("synced");
      }
      if (drawTimer.current) {
        clearTimeout(drawTimer.current);
        drawTimer.current = null;
        saveRemoteDrawings(drawLatest.current).catch(() => {});
      }
    };

    const onVis = () => {
      if (document.visibilityState === "visible") refresh().catch(() => {});
      else flush();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        state,
        ready,
        cloud: isCloud,
        sync,
        week,
        mutate,
        drawings: drawings.items,
        setDrawing,
      }}
    >
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
