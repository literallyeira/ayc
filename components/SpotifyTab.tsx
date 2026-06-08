"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import {
  spotifyClientId,
  beginAuth,
  ensureToken,
  getTopTracks,
  getTopArtists,
  getRecent,
  type TimeRange,
  type TopTrack,
  type TopArtist,
  type RecentItem,
} from "@/lib/spotify";
import type { SpotifyAuth } from "@/lib/types";
import { IconSpotify, IconMusic, IconExternal } from "./icons";

const RANGES: { key: TimeRange; label: string }[] = [
  { key: "short_term", label: "Son 4 hafta" },
  { key: "medium_term", label: "Son 6 ay" },
  { key: "long_term", label: "Tüm zamanlar" },
];

export function SpotifyTab() {
  const { state, mutate } = useStore();
  const auth = state.spotify;

  const [range, setRange] = useState<TimeRange>("short_term");
  const [type, setType] = useState<"tracks" | "artists">("tracks");
  const [tracks, setTracks] = useState<TopTrack[]>([]);
  const [artists, setArtists] = useState<TopArtist[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveAuth = useCallback(
    (a: SpotifyAuth) => mutate((d) => (d.spotify = a)),
    [mutate]
  );
  const disconnect = () => mutate((d) => (d.spotify = null));

  const token = useCallback(async () => {
    if (!auth) return null;
    return ensureToken(auth, saveAuth);
  }, [auth, saveAuth]);

  // Üst liste yükle
  useEffect(() => {
    if (!auth) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const t = await token();
        if (!t) throw new Error("token");
        if (type === "tracks") {
          const data = await getTopTracks(t, range);
          if (!cancelled) setTracks(data);
        } else {
          const data = await getTopArtists(t, range);
          if (!cancelled) setArtists(data);
        }
      } catch {
        if (!cancelled) setError("Veri alınamadı. Yeniden bağlanmayı dene.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, range, type, token]);

  // Son çalınanlar (bir kez)
  useEffect(() => {
    if (!auth) return;
    let cancelled = false;
    (async () => {
      try {
        const t = await token();
        if (!t) return;
        const data = await getRecent(t);
        if (!cancelled) setRecent(data);
      } catch {
        /* sessiz */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, token]);

  // ── Kurulum gerekiyor
  if (!spotifyClientId) {
    return (
      <div className="space-y-4">
        <Title />
        <div className="card border-amber-200 bg-amber-50 p-4 text-[13.5px] leading-relaxed text-amber-800">
          Spotify bağlantısı için <b>NEXT_PUBLIC_SPOTIFY_CLIENT_ID</b> eklenmemiş.
          Kurulum adımları: README → “Spotify”.
        </div>
      </div>
    );
  }

  // ── Bağlı değil
  if (!auth) {
    return (
      <div className="space-y-5">
        <Title />
        <div className="card flex flex-col items-center gap-4 px-5 py-10 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#1DB954]/12 text-[#1DB954]">
            <IconSpotify className="h-9 w-9" />
          </span>
          <div>
            <p className="font-display text-[18px] text-ink">Spotify’ı bağla</p>
            <p className="mt-1 max-w-[15rem] text-[13px] text-ink-muted">
              En çok dinlediğin şarkıları ve sanatçıları burada gör.
            </p>
          </div>
          <button
            onClick={() => beginAuth()}
            className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] px-5 py-2.5 text-[14px] font-semibold text-white shadow-soft transition-transform active:scale-95"
          >
            <IconSpotify className="h-5 w-5" /> Spotify ile bağlan
          </button>
        </div>
      </div>
    );
  }

  // ── Bağlı
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Title />
        <button
          onClick={disconnect}
          className="rounded-full bg-paper-sunk px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:bg-line"
        >
          Bağlantıyı kes
        </button>
      </div>

      {/* tür seçimi */}
      <div className="flex gap-2">
        {(["tracks", "artists"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 rounded-xl py-2 text-[13.5px] font-semibold transition-colors ${
              type === t ? "bg-lav-500 text-white" : "bg-paper-sunk text-ink-muted"
            }`}
          >
            {t === "tracks" ? "Şarkılar" : "Sanatçılar"}
          </button>
        ))}
      </div>

      {/* zaman aralığı */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              range === r.key ? "bg-lav-100 text-lav-700" : "bg-paper-sunk text-ink-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && <p className="px-1 text-[13px] text-blush-500">{error}</p>}
      {loading && <p className="px-1 text-[13px] text-ink-faint">Yükleniyor…</p>}

      {/* liste */}
      {!loading && (
        <div className="card divide-y divide-line overflow-hidden">
          {(type === "tracks" ? tracks : artists).map((item, i) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2.5 transition-colors hover:bg-paper-sunk"
            >
              <span className="w-5 shrink-0 text-center text-[13px] font-bold text-ink-faint">
                {i + 1}
              </span>
              <div
                className={`h-12 w-12 shrink-0 overflow-hidden bg-paper-sunk ${
                  type === "artists" ? "rounded-full" : "rounded-md"
                }`}
              >
                {item.image ? (
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-ink-faint">
                    <IconMusic className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-[14px] font-medium text-ink">{item.name}</div>
                <div className="line-clamp-1 text-[12px] text-ink-faint">
                  {type === "tracks"
                    ? (item as TopTrack).artists
                    : (item as TopArtist).genres || "sanatçı"}
                </div>
              </div>
              <IconExternal className="h-4 w-4 shrink-0 text-ink-faint" />
            </a>
          ))}
          {(type === "tracks" ? tracks : artists).length === 0 && (
            <p className="p-5 text-center text-[13px] text-ink-faint">
              Bu aralık için yeterli dinleme verisi yok.
            </p>
          )}
        </div>
      )}

      {/* son çalınanlar */}
      {recent.length > 0 && (
        <section className="pt-1">
          <h3 className="mb-2 px-1 text-[13px] font-medium text-ink-soft">Son çalınanlar</h3>
          <div className="flex gap-3 overflow-x-auto px-1 pb-1 no-scrollbar">
            {recent.map((r) => (
              <a
                key={r.playedAt}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="w-[104px] shrink-0"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-paper-sunk">
                  {r.image ? (
                    <img src={r.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-ink-faint">
                      <IconMusic className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="mt-1 line-clamp-1 text-[12px] font-medium text-ink">{r.name}</div>
                <div className="line-clamp-1 text-[11px] text-ink-faint">{r.artists}</div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Title() {
  return (
    <div className="px-1">
      <h2 className="flex items-center gap-2 font-display text-[20px] text-ink">
        <IconSpotify className="h-5 w-5 text-[#1DB954]" /> Müzik
      </h2>
      <p className="text-[12.5px] text-ink-faint">En çok dinlediklerin 🎧</p>
    </div>
  );
}
