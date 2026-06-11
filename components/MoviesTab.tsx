"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { AutoArea } from "./fields";
import { IconSearch, IconHeart, IconFilm, IconPlus, IconCheck, IconClose } from "./icons";
import type { Movie } from "@/lib/types";

interface Result {
  id: number;
  title: string;
  year: string;
  poster: string;
  overview: string;
}

const posterUrl = (p: string, size = "w342") =>
  p ? `https://image.tmdb.org/t/p/${size}${p}` : "";

function Hearts({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={() => onChange(value === i ? 0 : i)}
          className="text-blush-500 transition-transform active:scale-90"
          aria-label={`${i} kalp`}
        >
          <IconHeart filled={i <= value} className={`h-4 w-4 ${i <= value ? "" : "text-blush-400/40"}`} />
        </button>
      ))}
    </div>
  );
}

export function MoviesTab() {
  const { state, mutate } = useStore();
  const movies = state.movies ?? [];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<"" | "no_key" | "net">("");
  const [filter, setFilter] = useState<"all" | "watched" | "watchlist">("all");
  const [noteOpen, setNoteOpen] = useState<number | null>(null);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/movies/search?q=${encodeURIComponent(q)}`);
        if (r.status === 503) {
          setErr("no_key");
          setResults([]);
          return;
        }
        if (!r.ok) throw new Error();
        const data = await r.json();
        setErr("");
        setResults(data.results ?? []);
      } catch {
        setErr("net");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  const has = (id: number) => movies.some((m) => m.id === id);

  const addMovie = (r: Result) =>
    mutate((d) => {
      if ((d.movies ?? []).some((m) => m.id === r.id)) return;
      const mv: Movie = {
        id: r.id,
        title: r.title,
        year: r.year,
        poster: r.poster,
        status: "watched",
        rating: 0,
        note: "",
        addedAt: Date.now(),
      };
      d.movies = [mv, ...(d.movies ?? [])];
    }, true);

  const update = (id: number, patch: Partial<Movie>) =>
    mutate((d) => {
      d.movies = (d.movies ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m));
    });

  const remove = (id: number) =>
    mutate((d) => {
      d.movies = (d.movies ?? []).filter((m) => m.id !== id);
      // cihazlar arası birleştirmede geri dirilmesin
      d.removed = { ...(d.removed ?? {}), [`movie:${id}`]: Date.now() };
    });

  const counts = {
    all: movies.length,
    watched: movies.filter((m) => m.status === "watched").length,
    watchlist: movies.filter((m) => m.status === "watchlist").length,
  };
  const shown = movies.filter((m) => filter === "all" || m.status === filter);

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="font-display text-[20px] text-ink">Filmler</h2>
        <p className="text-[12.5px] text-ink-faint">İzlediklerinizi kaydet, izleyeceklerini biriktir 🍿</p>
      </div>

      {/* Arama */}
      <div className="space-y-3">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Film ara… (örn. La La Land)"
            className="field pl-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-faint hover:bg-paper-sunk"
              aria-label="Temizle"
            >
              <IconClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {err === "no_key" && (
          <div className="card border-amber-200 bg-amber-50 p-3.5 text-[13px] text-amber-700">
            Film araması için TMDB API anahtarı eklenmemiş. (Kurulum: README → “Film araması”.)
          </div>
        )}
        {err === "net" && (
          <p className="px-1 text-[13px] text-blush-500">Bağlantı sorunu, tekrar dene.</p>
        )}

        {loading && <p className="px-1 text-[13px] text-ink-faint">Aranıyor…</p>}

        {results.length > 0 && (
          <div className="card divide-y divide-line overflow-hidden">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2.5">
                <div className="h-[66px] w-[44px] shrink-0 overflow-hidden rounded-md bg-paper-sunk">
                  {r.poster ? (
                    <img src={posterUrl(r.poster, "w185")} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-ink-faint">
                      <IconFilm className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-[14px] font-medium text-ink">{r.title}</div>
                  <div className="text-[12px] text-ink-faint">{r.year || "—"}</div>
                </div>
                <button
                  onClick={() => addMovie(r)}
                  disabled={has(r.id)}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    has(r.id)
                      ? "bg-sage-100 text-sage-600"
                      : "bg-lav-500 text-white active:scale-95"
                  }`}
                >
                  {has(r.id) ? <IconCheck className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
                  {has(r.id) ? "Eklendi" : "Ekle"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtre */}
      {movies.length > 0 && (
        <div className="flex gap-2">
          {([
            ["all", "Tümü"],
            ["watched", "İzlendi"],
            ["watchlist", "İzlenecek"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                filter === k ? "bg-lav-500 text-white" : "bg-paper-sunk text-ink-muted"
              }`}
            >
              {label} <span className="opacity-70">{counts[k]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Kayıtlı filmler */}
      {movies.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-4 py-10 text-center">
          <IconFilm className="h-7 w-7 text-lav-300" />
          <p className="text-[13.5px] text-ink-muted">Henüz film yok. Yukarıdan arayıp ekle 🎬</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {shown.map((m) => (
            <div key={m.id} className="card overflow-hidden">
              <div className="relative aspect-[2/3] bg-paper-sunk">
                {m.poster ? (
                  <img src={posterUrl(m.poster)} alt={m.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-ink-faint">
                    <IconFilm className="h-8 w-8" />
                  </div>
                )}
                <button
                  onClick={() => remove(m.id)}
                  className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-ink/45 text-white backdrop-blur-sm transition-transform active:scale-90"
                  aria-label="Kaldır"
                >
                  <IconClose className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    update(m.id, { status: m.status === "watched" ? "watchlist" : "watched" })
                  }
                  className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold backdrop-blur-sm ${
                    m.status === "watched"
                      ? "bg-sage-500/90 text-white"
                      : "bg-lav-500/90 text-white"
                  }`}
                >
                  {m.status === "watched" ? "İzlendi" : "İzlenecek"}
                </button>
              </div>
              <div className="space-y-1.5 p-2.5">
                <div className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">
                  {m.title}
                </div>
                <div className="text-[11.5px] text-ink-faint">{m.year || "—"}</div>
                <Hearts value={m.rating} onChange={(v) => update(m.id, { rating: v })} />
                <button
                  onClick={() => setNoteOpen(noteOpen === m.id ? null : m.id)}
                  className="text-[11.5px] font-medium text-lav-600"
                >
                  {m.note ? "notu düzenle" : "+ not ekle"}
                </button>
                {noteOpen === m.id && (
                  <AutoArea
                    value={m.note}
                    onChange={(v) => update(m.id, { note: v })}
                    placeholder="kısa not…"
                    rows={2}
                    className="text-[12.5px]"
                  />
                )}
                {m.note && noteOpen !== m.id && (
                  <p className="line-clamp-2 text-[11.5px] italic text-ink-soft">“{m.note}”</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
