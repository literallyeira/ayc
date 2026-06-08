import type { DayPlan } from "./types";

// PDF'teki "Haftalık program (blok planı)" birebir kodlandı.
// Her gün 4 blok. Bloklar 45–60 dk (vakte göre 60–75 dk) planlanabilir.

export const PROGRAM: DayPlan[] = [
  {
    key: "pazartesi",
    label: "Pazartesi",
    short: "Pzt",
    blocks: [
      { title: "TYT Matematik (Konu)", category: "tyt", tag: "Matematik" },
      { title: "TYT Matematik (Soru)", category: "tyt", tag: "Matematik" },
      { title: "YDT Kelime + Reading", category: "ydt", tag: "YDT" },
      { title: "TYT Türkçe — Paragraf + Analiz", category: "tyt", tag: "Türkçe" },
    ],
  },
  {
    key: "sali",
    label: "Salı",
    short: "Sal",
    blocks: [
      { title: "TYT Türkçe (Dil bilgisi / Anlam)", category: "tyt", tag: "Türkçe" },
      { title: "TYT Türkçe (Soru)", category: "tyt", tag: "Türkçe" },
      { title: "YDT Grammar (Konu + Soru)", category: "ydt", tag: "Grammar" },
      { title: "YDT Reading + Çeviri", category: "ydt", tag: "Reading" },
    ],
  },
  {
    key: "carsamba",
    label: "Çarşamba",
    short: "Çar",
    blocks: [
      { title: "TYT Sosyal (Konu)", category: "tyt", tag: "Sosyal" },
      { title: "TYT Sosyal (Soru)", category: "tyt", tag: "Sosyal" },
      { title: "YDT Kelime + Reading", category: "ydt", tag: "YDT" },
      { title: "TYT Fen (Konu)", category: "tyt", tag: "Fen" },
    ],
  },
  {
    key: "persembe",
    label: "Perşembe",
    short: "Per",
    blocks: [
      { title: "TYT Fen (Soru)", category: "tyt", tag: "Fen" },
      { title: "TYT Matematik (Problem Rutini)", category: "tyt", tag: "Matematik" },
      { title: "YDT Grammar + Kelime", category: "ydt", tag: "Grammar" },
      { title: "Yanlış Defteri + Tekrar", category: "analiz", tag: "Tekrar" },
    ],
  },
  {
    key: "cuma",
    label: "Cuma",
    short: "Cum",
    blocks: [
      { title: "TYT Türkçe (Paragraf + Hız)", category: "tyt", tag: "Türkçe" },
      { title: "TYT Sosyal / Fen (Karışık Test)", category: "tyt", tag: "Karışık" },
      { title: "YDT Reading (2 parça)", category: "ydt", tag: "Reading" },
      { title: "Mini analiz / Zayıf konu tamiri", category: "analiz", tag: "Analiz" },
    ],
  },
  {
    key: "cumartesi",
    label: "Cumartesi",
    short: "Cmt",
    blocks: [
      { title: "TYT Denemesi", category: "deneme", tag: "Deneme" },
      { title: "TYT Deneme Analizi", category: "analiz", tag: "Analiz" },
      { title: "YDT Kelime + Hafif Reading", category: "ydt", tag: "YDT" },
      { title: "Yanlış defteri güncelle", category: "analiz", tag: "Tekrar" },
    ],
  },
  {
    key: "pazar",
    label: "Pazar",
    short: "Paz",
    blocks: [
      { title: "YDT Denemesi", category: "deneme", tag: "Deneme" },
      { title: "YDT Deneme Analizi", category: "analiz", tag: "Analiz" },
      { title: "Haftalık tekrar (2 TYT + 1 YDT)", category: "analiz", tag: "Tekrar" },
      { title: "Yeni hafta planı", category: "analiz", tag: "Plan" },
    ],
  },
];

// PDF'teki "Haftalık minimum hedefler (takip)"
export interface TargetDef {
  key: string;
  label: string;
  target: string;
}

export const WEEKLY_TARGETS: TargetDef[] = [
  { key: "paragraf", label: "TYT Paragraf", target: "150–200" },
  { key: "matematik", label: "TYT Matematik (soru)", target: "250–400" },
  { key: "fensosyal", label: "TYT Fen + Sosyal (soru)", target: "200–300" },
  { key: "ydtKelime", label: "YDT Kelime", target: "150–250 yeni + tekrar" },
  { key: "ydtReading", label: "YDT Reading", target: "7–10 parça" },
];

// Günlük rutin açıklaması (PDF)
export const ROUTINE_HINT = "Her gün: kelime, reading ve paragraf rutinini koru.";

export const CATEGORY_META: Record<
  string,
  { label: string; dot: string; chipBg: string; chipText: string }
> = {
  tyt: { label: "TYT", dot: "bg-lav-500", chipBg: "bg-lav-100", chipText: "text-lav-700" },
  ydt: { label: "YDT", dot: "bg-blush-500", chipBg: "bg-blush-100", chipText: "text-blush-500" },
  analiz: { label: "Analiz", dot: "bg-sage-500", chipBg: "bg-sage-100", chipText: "text-sage-600" },
  deneme: { label: "Deneme", dot: "bg-amber-500", chipBg: "bg-amber-100", chipText: "text-amber-600" },
};
