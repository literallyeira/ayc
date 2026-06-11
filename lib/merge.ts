import type { AppState, WeekData, Movie, Exam, JournalEntry } from "./types";
import type { DrawingsDoc } from "./supabase";

// İki durum belgesini alan/öğe bazında birleştirir.
//
// Eski yaklaşım belgeyi bütün halinde "son yazan kazanır" ile değiştiriyordu;
// iki cihaz kullanılınca (telefon + bilgisayar) eski veriye sahip cihaz
// herhangi bir değişiklik yapınca diğerinin eklediklerini (filmler, günlük,
// işaretler…) ezip siliyordu. Burada koleksiyonlar id/anahtar bazında
// birleşir, silinenler tombstone (state.removed) ile takip edilir.

// Çakışan metinlerde yeni belgedeki dolu değer kazanır; yeni boşsa eski korunur.
const pickText = (primary: string, fallback: string) => primary || fallback;

function mergeTextObj<T extends Record<string, string>>(n: T, o: T): T {
  const out: Record<string, string> = { ...n };
  for (const k of Object.keys(o)) {
    if (!out[k]) out[k] = o[k];
  }
  return out as T;
}

function mergeWeek(n: WeekData, o: WeekData): WeekData {
  const targets: WeekData["targets"] = { ...o.targets };
  for (const [k, v] of Object.entries(n.targets)) {
    const old = targets[k];
    targets[k] = old
      ? { actual: pickText(v.actual, old.actual), note: pickText(v.note, old.note) }
      : v;
  }
  return {
    // anahtar bazında: yeni belgede açıkça işaretlenen/kaldırılan kazanır,
    // yalnız eskide olan anahtarlar korunur
    done: { ...o.done, ...n.done },
    goals: mergeTextObj(n.goals, o.goals),
    routine: mergeTextObj(n.routine, o.routine),
    targets,
    evaluation: mergeTextObj(n.evaluation, o.evaluation),
  };
}

export function mergeStates(a: AppState, b: AppState): AppState {
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const older = newer === a ? b : a;

  // Tombstone'lar: her iki cihazın sildiği her şeyi bil
  const removed: Record<string, number> = { ...(older.removed ?? {}) };
  for (const [k, ts] of Object.entries(newer.removed ?? {})) {
    removed[k] = Math.max(removed[k] ?? 0, ts);
  }

  // Filmler: id bazlı birleşim. Silindiyse (tombstone, eklenmeden sonra) gelmez;
  // silindikten sonra tekrar eklendiyse (addedAt > tombstone) yaşar.
  const movieMap = new Map<number, Movie>();
  for (const m of older.movies ?? []) movieMap.set(m.id, m);
  for (const m of newer.movies ?? []) {
    const prev = movieMap.get(m.id);
    movieMap.set(
      m.id,
      prev
        ? {
            ...m,
            note: pickText(m.note, prev.note),
            rating: m.rating || prev.rating,
          }
        : m
    );
  }
  const movies = [...movieMap.values()]
    .filter((m) => (removed[`movie:${m.id}`] ?? 0) < m.addedAt)
    .sort((x, y) => y.addedAt - x.addedAt);

  // Denemeler: id (uuid) bazlı birleşim + tombstone
  const examMap = new Map<string, Exam>();
  for (const e of older.exams ?? []) examMap.set(e.id, e);
  for (const e of newer.exams ?? []) {
    const prev = examMap.get(e.id);
    examMap.set(
      e.id,
      prev
        ? {
            ...e,
            name: pickText(e.name, prev.name),
            net: pickText(e.net, prev.net),
            topError: pickText(e.topError, prev.topError),
            plan: pickText(e.plan, prev.plan),
          }
        : e
    );
  }
  const exams = [...examMap.values()].filter((e) => !removed[`exam:${e.id}`]);

  // Haftalar: hafta bazında birleşim
  const weeks: Record<string, WeekData> = { ...older.weeks };
  for (const [ws, wd] of Object.entries(newer.weeks)) {
    weeks[ws] = weeks[ws] ? mergeWeek(wd, weeks[ws]) : wd;
  }

  // Günlük: tarih bazında; aynı günde dolu not / mood kaybolmasın
  const journal: Record<string, JournalEntry> = { ...older.journal };
  for (const [date, e] of Object.entries(newer.journal)) {
    const old = journal[date];
    journal[date] = old
      ? { note: pickText(e.note, old.note), mood: e.mood || old.mood }
      : e;
  }

  // Spotify: süresi daha geç dolan token kazanır
  const spotify =
    newer.spotify && older.spotify
      ? newer.spotify.expiresAt >= older.spotify.expiresAt
        ? newer.spotify
        : older.spotify
      : newer.spotify ?? older.spotify;

  const newerBest = newer.games?.snakeBest ?? 0;
  const olderBest = older.games?.snakeBest ?? 0;

  return {
    version: Math.max(newer.version, older.version),
    updatedAt: Math.max(newer.updatedAt, older.updatedAt),
    weeks,
    targetDefs: mergeTextObj(
      newer.targetDefs as Record<string, string>,
      older.targetDefs as Record<string, string>
    ),
    exams,
    movies,
    persona: newer.persona ?? older.persona,
    chat: (newer.chat?.length ?? 0) >= (older.chat?.length ?? 0) ? newer.chat : older.chat,
    spotify,
    journal,
    activity: { ...older.activity, ...newer.activity },
    removed,
    games: { snakeBest: Math.max(newerBest, olderBest) },
  };
}

// Çizimler: gün bazında birleşim; aynı günde yeni belge kazanır
export function mergeDrawings(a: DrawingsDoc, b: DrawingsDoc): DrawingsDoc {
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const older = newer === a ? b : a;
  return {
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    items: { ...older.items, ...newer.items },
  };
}
