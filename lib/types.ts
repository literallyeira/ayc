// Veri modelleri

export type DayKey =
  | "pazartesi"
  | "sali"
  | "carsamba"
  | "persembe"
  | "cuma"
  | "cumartesi"
  | "pazar";

export type Category = "tyt" | "ydt" | "analiz" | "deneme";

export interface Block {
  title: string;
  category: Category;
  tag: string; // kısa etiket, örn "Matematik"
}

export interface DayPlan {
  key: DayKey;
  label: string;
  short: string; // "Pzt"
  blocks: Block[];
}

// Haftaya özel, kullanıcının doldurduğu veriler
export interface WeekData {
  // her gün için 4 bloğun tamamlanma durumu: "pazartesi-0" -> true
  done: Record<string, boolean>;
  goals: {
    tytTurkce: string;
    tytMatematik: string;
    tytFen: string;
    tytSosyal: string;
    ydtKelime: string;
    ydtReading: string;
    ydtGrammar: string;
  };
  routine: {
    kelimeYeni: string;
    kelimeTekrar: string;
    reading: string;
    paragraf: string;
  };
  // haftalık minimum hedeflerde "gerçekleşen" sayılar
  targets: Record<string, { actual: string; note: string }>;
  evaluation: {
    enIyi: string;
    enZorlayan: string;
    netHamle: string;
    gelecekOdak: string;
  };
}

export interface Exam {
  id: string;
  date: string; // ISO yyyy-mm-dd
  type: "TYT" | "YDT";
  name: string;
  net: string; // serbest: "85" ya da "85 net"
  topError: string;
  plan: string;
}

export interface JournalEntry {
  note: string;
  mood: number; // 1..5
}

export interface Persona {
  me: string; // kullanıcının WhatsApp'taki adı
  partner: string;
  samples: string[]; // kullanıcının örnek mesajları (üslup)
  examples: { q: string; a: string }[]; // partner -> kullanıcı yanıt çiftleri
  builtAt: number;
}

export interface ChatMsg {
  role: "user" | "assistant"; // user = Ayça, assistant = AI (kullanıcı gibi)
  content: string;
  ts: number;
}

export interface SpotifyAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Movie {
  id: number; // TMDB id
  title: string;
  year: string;
  poster: string; // TMDB poster_path (örn /abc.jpg) ya da ""
  status: "watched" | "watchlist";
  rating: number; // 0..5
  note: string;
  addedAt: number;
}

export interface AppState {
  version: number;
  updatedAt: number;
  // haftalar: weekStartISO (Pazartesi) -> WeekData
  weeks: Record<string, WeekData>;
  // haftalık minimum hedeflerin (kullanıcı tarafından düzenlenebilen) değerleri
  // key -> hedef metni; tanımlı değilse program.ts'teki varsayılan kullanılır
  targetDefs: Record<string, string>;
  exams: Exam[];
  movies: Movie[];
  persona: Persona | null;
  chat: ChatMsg[];
  spotify: SpotifyAuth | null;
  // günlük: yyyy-mm-dd -> entry
  journal: Record<string, JournalEntry>;
  // aktivite günleri (streak için): yyyy-mm-dd seti
  activity: Record<string, true>;
}
