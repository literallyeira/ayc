# Çalışma Programı 💜

YKS (TYT + YDT) haftalık çalışma programını mobil öncelikli, interaktif bir takip sitesine dönüştüren uygulama. PDF'teki blok planı, hedefler, denemeler ve haftalık değerlendirme birebir burada — üstüne işaretleme, streak, Pomodoro, günlük ve net grafikleri eklendi.

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind
- **Senkron:** Supabase (çoklu cihaz) — kurulmazsa otomatik olarak sadece o cihazda (localStorage) çalışır
- **Tema:** Sakin beyaz/lavanta, Fraunces + Hanken Grotesk

## İçindekiler / Özellikler

- 📅 **Hafta** — 7 gün × 4 blok, dokununca işaretlenir, gün/hafta ilerlemesi, hafta ileri-geri gezinme, “Bugün” vurgusu, Pazar değerlendirmesi
- 🎯 **Hedefler** — TYT/YDT haftalık hedefler, günlük rutin, haftalık minimum hedef takibi
- 📊 **Denemeler** — deneme ekle/sil, net gelişim grafiği
- 📓 **Günlük** — mood + serbest not + güne özel motivasyon, geçmiş notlar
- ⏱️ **Pomodoro** — 45/50/60 dk odak + mola, her yerden erişilebilen yüzen buton
- ✏️ **Çizim** — basınca duyarlı kalemle günlük karalama, her güne ayrı, ana sayfada önizleme
- 🎬 **Filmler** — TMDB ile film arama (kapak + ad), izlendi/izlenecek, kalp puanı, not
- 🎧 **Müzik** — Spotify bağlanır; en çok dinlenen şarkı/sanatçı (4 hafta / 6 ay / tüm zamanlar) + son çalınanlar
- 🔥 **Streak & ilerleme halkası** — header'da

---

## 1) Çalıştırma (yerel)

```bash
npm install
npm run dev
```

Tarayıcıda **http://localhost:3000** — bu haliyle hiçbir kurulum gerektirmeden **sadece o cihazda** (localStorage) çalışır.

## 2) Kişiselleştirme (ona özel yap)

Tek dosya: **`lib/config.ts`**

```ts
name: "Aşkım",            // header'da "Günaydın, ___" diye görünür → ismini yaz
welcome: "...",          // girişteki kısa mesaj
motivations: [ "...", ], // günlük dönen motivasyon cümleleri (istediğini ekle)
```

İstersen renkleri `tailwind.config.ts` içindeki `lav` / `blush` / `sage` tonlarından değiştirebilirsin.

## 3) Çoklu cihaz senkronu (Supabase — ücretsiz)

Telefon + bilgisayardan aynı veriye erişmek ve verinin asla kaybolmaması için:

1. **[supabase.com](https://supabase.com)** → ücretsiz hesap → **New project** (bir şifre belirle, bölgeyi yakın seç).
2. Proje açılınca sol menüden **SQL Editor** → aşağıdakini yapıştır → **Run**:

   ```sql
   create table app_state (
     id text primary key,
     data jsonb not null,
     updated_at bigint not null
   );

   alter table app_state enable row level security;

   -- Tek kişilik kişisel kullanım: anon anahtarla okuma/yazmaya izin
   create policy "kisisel erisim" on app_state
     for all using (true) with check (true);
   ```

3. Sol menü **Project Settings → API**'den şu ikisini kopyala:
   - **Project URL**
   - **anon public** anahtarı
4. Proje kökünde `.env.local.example` dosyasını `.env.local` olarak kopyala ve doldur:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

5. `npm run dev` ile yeniden başlat. Header'da nokta **“Senkron”** (yeşil) olursa bağlandı demektir.

> Not: `anon` anahtarı tarayıcıda görünür; bu yüzden kurulum **tek kişilik kişisel kullanım** içindir. Linki paylaşan herkes aynı veriyi görür — siteyi gizli tut. (İstersen ileride basit bir parola ekleyebiliriz.)

## 3.5) Film araması (TMDB — ücretsiz)

Film aramanın çalışması için ücretsiz bir TMDB API anahtarı gerekir:

1. **[themoviedb.org](https://www.themoviedb.org/signup)** → ücretsiz hesap aç.
2. **Settings → API** → “Create / Request an API Key” → tip olarak **Developer** seç, formu doldur (web sitesi olarak Vercel linkini ya da `http://localhost` yazabilirsin).
3. Sana verilen **“API Key (v3 auth)”** değerini kopyala.
4. `.env.local` dosyasına ekle (ve Vercel’de de environment variable olarak):

   ```
   TMDB_API_KEY=buraya_v3_anahtarı
   ```

> Bu anahtar **sunucuda** kalır (`NEXT_PUBLIC_` değil), tarayıcıya sızmaz. Aramalar `app/api/movies/search` route’u üzerinden geçer. Anahtar eklenmezse uygulama çalışır, sadece film araması devre dışı kalır.

## 3.6) Spotify (ücretsiz — “en çok dinlenenler”)

PKCE akışı kullanıldığı için **client secret gerekmez**, sadece bir Client ID yeter:

1. **[developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)** → giriş → **Create app**.
2. Adı/açıklaması fark etmez. **Redirect URIs** kısmına şunları **tam olarak** ekle (sonundaki `/` dahil):
   - Yerel için: `http://127.0.0.1:3000/`  ⚠️ `localhost` değil, `127.0.0.1` olmalı.
   - Canlı için: `https://SENIN-VERCEL-LINKIN.vercel.app/`
3. **Which API/SDKs** → “Web API” seç → kaydet.
4. App açılınca **Settings**’ten **Client ID**’yi kopyala.
5. `.env.local` (ve Vercel env) içine ekle:

   ```
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=client_id_buraya
   ```

6. Uygulama **Development Mode**’da başlar; bu modda sadece izin verdiğin hesaplar bağlanabilir.
   Dashboard → **User Management** → kız arkadaşının Spotify hesabının **adı + e-postasını** ekle.
   (Ya da “Request extension” ile herkese açabilirsin, ama kişisel kullanım için gerekmez.)

> Yerelde denerken siteyi `http://127.0.0.1:3000` üzerinden aç (redirect URI ile eşleşmesi için).
> Spotify token’ları senkronlanan veride tutulur; secret olmadığından güvenlik riski düşüktür.

## 4) Vercel'e deploy

1. Kodu bir GitHub reposuna pushla.
2. **[vercel.com](https://vercel.com)** → **Add New → Project** → repoyu seç (Next.js'i otomatik tanır).
3. **Environment Variables** kısmına şunları ekle:
   - `NEXT_PUBLIC_SUPABASE_URL` (senkron için)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (senkron için)
   - `TMDB_API_KEY` (film araması için)
   - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` (müzik için)
4. **Deploy.** Çıkan linki ona gönder; telefonda açıp **“Ana ekrana ekle”** ile uygulama gibi kullanabilir. 📱

> Supabase değişkenlerini eklemezsen site yine sorunsuz çalışır, sadece veriler o cihazda kalır.

---

## Proje yapısı

```
app/            layout, global stiller, sayfa
components/     Header, WeekPlan, GoalsTab, ExamsTab, JournalTab,
                EvaluationCard, Pomodoro, BottomNav, ProgressRing, ikonlar
lib/            program.ts (PDF planı), types, store (senkron), supabase, date, config
```

Verinin tamamı tek bir JSON state'te tutulur; her değişiklik anında localStorage'a, varsa buluta (700ms debounce) yazılır. Sekmeye dönünce buluttan tazelenir (last-write-wins).
