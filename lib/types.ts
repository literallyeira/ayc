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

export interface AppState {
  version: number;
  updatedAt: number;
  // haftalar: weekStartISO (Pazartesi) -> WeekData
  weeks: Record<string, WeekData>;
  exams: Exam[];
  // günlük: yyyy-mm-dd -> entry
  journal: Record<string, JournalEntry>;
  // aktivite günleri (streak için): yyyy-mm-dd seti
  activity: Record<string, true>;
}
