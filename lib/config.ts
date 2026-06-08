// ─────────────────────────────────────────────────────────────
//  KİŞİSELLEŞTİRME — buradan değiştir
//  (Sadece bu dosyayı düzenleyerek siteyi ona özel yapabilirsin)
// ─────────────────────────────────────────────────────────────

export const CONFIG = {
  // Adı: header'da "Merhaba, ___" şeklinde görünür.
  name: "Aşkım",

  // Onu karşılayan kısa bir mesaj (girişte görünür).
  welcome: "Bugün küçük bir adım at, gerisi gelir. Buradayım 💜",

  // Pazar değerlendirmesi / boş ekranlarda dönen küçük motivasyon notları.
  // İstediğin kadar ekle/çıkar.
  motivations: [
    "Bir blok bile büyük bir kazanç. Devam.",
    "Net senin, panik değil. Sakin ve istikrarlı.",
    "Bugün yaptığın tekrar, sınavda hatırladığın şey olacak.",
    "Mükemmel değil, tutarlı ol. Seninle gurur duyuyorum.",
    "Yorulduğunda 5 dk mola ver, sonra bir blok daha.",
    "Yanlışların yol haritan. Düzeltince güçleniyorsun.",
    "Her işaretlediğin kutucuk, hedefe bir adım daha.",
  ],
};

export type AppConfig = typeof CONFIG;
