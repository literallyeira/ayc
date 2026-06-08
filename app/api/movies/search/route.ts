import { NextResponse } from "next/server";

// TMDB arama proxy'si — API anahtarı sunucuda kalır (tarayıcıya sızmaz).
// Ortam değişkeni: TMDB_API_KEY (v3 anahtarı)

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "no_key", message: "TMDB_API_KEY tanımlı değil." },
      { status: 503 }
    );
  }

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const url =
    `https://api.themoviedb.org/3/search/movie?api_key=${key}` +
    `&query=${encodeURIComponent(q)}&language=tr-TR&include_adult=false&page=1`;

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json(
        { error: "tmdb", status: r.status },
        { status: 502 }
      );
    }
    const data = await r.json();
    const results = (data.results ?? []).slice(0, 12).map((m: any) => ({
      id: m.id,
      title: m.title || m.original_title || "",
      year: (m.release_date || "").slice(0, 4),
      poster: m.poster_path || "",
      overview: m.overview || "",
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
