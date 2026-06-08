// Tarih yardımcıları (Pazartesi başlangıçlı haftalar, Türkçe biçim)

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

// Verilen tarihin içinde bulunduğu haftanın Pazartesi'si
export function mondayOf(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // Pazartesi=0 ... Pazar=6
  date.setDate(date.getDate() - day);
  return date;
}

export function weekStartISO(d: Date = new Date()): string {
  return toISODate(mondayOf(d));
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + n);
  return toISODate(date);
}

export function addWeeks(iso: string, n: number): string {
  return addDays(iso, n * 7);
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${TR_MONTHS[m - 1]}`;
}

export function formatWeekRange(weekStart: string): string {
  const end = addDays(weekStart, 6);
  const [, sm] = weekStart.split("-").map(Number);
  const [, em] = end.split("-").map(Number);
  const startN = Number(weekStart.split("-")[2]);
  const endN = Number(end.split("-")[2]);
  if (sm === em) {
    return `${startN}–${endN} ${TR_MONTHS[sm - 1]}`;
  }
  return `${startN} ${TR_MONTHS[sm - 1]} – ${endN} ${TR_MONTHS[em - 1]}`;
}

export function dayISOForWeek(weekStart: string, dayIndex: number): string {
  return addDays(weekStart, dayIndex);
}

// Bugünün hafta içindeki günü (0..6) ya da -1 (bu haftada değilse)
export function currentDayIndex(weekStart: string): number {
  const today = todayISO();
  for (let i = 0; i < 7; i++) {
    if (dayISOForWeek(weekStart, i) === today) return i;
  }
  return -1;
}

// Streak: aktivite günlerinden bugünden geriye kesintisiz gün sayısı
export function computeStreak(activity: Record<string, true>): number {
  let streak = 0;
  let cursor = new Date();
  // bugün aktivite yoksa dünden başla (bugünü henüz yapmamış olabilir)
  if (!activity[toISODate(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  // güvenlik için en fazla 400 gün geri
  for (let i = 0; i < 400; i++) {
    if (activity[toISODate(cursor)]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const TR_MONTHS_LIST = TR_MONTHS;
