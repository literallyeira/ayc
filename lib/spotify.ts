import type { SpotifyAuth } from "./types";

// Spotify — Authorization Code + PKCE akışı (client secret GEREKMEZ).
// Sadece NEXT_PUBLIC_SPOTIFY_CLIENT_ID gerekir; her şey tarayıcıda çalışır.

const AUTH = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const SCOPES = "user-top-read user-read-recently-played";

export const spotifyClientId =
  process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";

function redirectUri() {
  return window.location.origin + "/";
}

function randomString(len: number) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => ("0" + b.toString(16)).slice(-2)).join("").slice(0, len);
}

async function sha256(s: string) {
  const data = new TextEncoder().encode(s);
  return crypto.subtle.digest("SHA-256", data);
}

function b64url(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function beginAuth() {
  if (!spotifyClientId) {
    throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID tanımlı değil.");
  }
  // Önceki hataları temizle
  localStorage.removeItem("sp_err");
  const verifier = randomString(96);
  const challenge = b64url(await sha256(verifier));
  const state = randomString(16);
  localStorage.setItem("sp_verifier", verifier);
  localStorage.setItem("sp_state", state);
  const p = new URLSearchParams({
    response_type: "code",
    client_id: spotifyClientId,
    scope: SCOPES,
    redirect_uri: redirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });
  window.location.assign(`${AUTH}?${p.toString()}`);
}

// Sayfa Spotify'dan dönünce çağrılır. ?code yoksa null döner.
export async function completeAuthFromUrl(): Promise<SpotifyAuth | null> {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const clean = () => {
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.pathname + url.hash);
  };
  const fail = (msg: string) => {
    localStorage.setItem("sp_err", msg);
    clean();
    return null;
  };

  if (error) return fail(`Spotify isteği reddetti: ${error}`);
  if (!code) return null;

  const verifier = localStorage.getItem("sp_verifier");
  const storedState = localStorage.getItem("sp_state");
  if (!verifier) return fail("Güvenlik anahtarı bulunamadı (farklı cihaz/sekme?).");
  if (state !== storedState) return fail("Güvenlik doğrulaması (state) eşleşmedi.");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
    client_id: spotifyClientId,
    code_verifier: verifier,
  });
  try {
    const r = await fetch(TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    localStorage.removeItem("sp_verifier");
    localStorage.removeItem("sp_state");
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return fail(`Token alınamadı (${r.status}). ${t.slice(0, 200)}`);
    }
    const d = await r.json();
    localStorage.removeItem("sp_err");
    clean();
    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      expiresAt: Date.now() + d.expires_in * 1000,
    };
  } catch (e) {
    return fail(`Ağ hatası: ${String(e)}`);
  }
}

export function lastSpotifyError(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("sp_err") || "";
}

export function clearSpotifyError() {
  if (typeof window !== "undefined") localStorage.removeItem("sp_err");
}

async function refresh(refreshToken: string): Promise<SpotifyAuth | null> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: spotifyClientId,
  });
  const r = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) return null;
  const d = await r.json();
  return {
    accessToken: d.access_token,
    refreshToken: d.refresh_token || refreshToken,
    expiresAt: Date.now() + d.expires_in * 1000,
  };
}

// Geçerli access token döndürür; süresi dolmuşsa yeniler ve onSave ile saklar.
export async function ensureToken(
  auth: SpotifyAuth,
  onSave: (a: SpotifyAuth) => void
): Promise<string | null> {
  if (auth.expiresAt > Date.now() + 30_000) return auth.accessToken;
  const next = await refresh(auth.refreshToken);
  if (!next) return null;
  onSave(next);
  return next.accessToken;
}

async function spApi(path: string, token: string) {
  const r = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface TopTrack {
  id: string;
  name: string;
  artists: string;
  image: string;
  url: string;
}
export interface TopArtist {
  id: string;
  name: string;
  image: string;
  url: string;
  genres: string;
}

export async function getTopTracks(token: string, range: TimeRange): Promise<TopTrack[]> {
  const d = await spApi(`/me/top/tracks?time_range=${range}&limit=25`, token);
  return (d.items ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    artists: (t.artists ?? []).map((a: any) => a.name).join(", "),
    image: t.album?.images?.[t.album.images.length - 1]?.url || t.album?.images?.[0]?.url || "",
    url: t.external_urls?.spotify || "",
  }));
}

export async function getTopArtists(token: string, range: TimeRange): Promise<TopArtist[]> {
  const d = await spApi(`/me/top/artists?time_range=${range}&limit=25`, token);
  return (d.items ?? []).map((a: any) => ({
    id: a.id,
    name: a.name,
    image: a.images?.[a.images.length - 1]?.url || a.images?.[0]?.url || "",
    url: a.external_urls?.spotify || "",
    genres: (a.genres ?? []).slice(0, 2).join(" · "),
  }));
}

export interface RecentItem {
  id: string;
  name: string;
  artists: string;
  image: string;
  url: string;
  playedAt: string;
}

export async function getRecent(token: string): Promise<RecentItem[]> {
  const d = await spApi(`/me/player/recently-played?limit=20`, token);
  const seen = new Set<string>();
  const out: RecentItem[] = [];
  for (const it of d.items ?? []) {
    const t = it.track;
    if (!t || seen.has(t.id)) continue;
    seen.add(t.id);
    out.push({
      id: t.id,
      name: t.name,
      artists: (t.artists ?? []).map((a: any) => a.name).join(", "),
      image: t.album?.images?.[t.album.images.length - 1]?.url || "",
      url: t.external_urls?.spotify || "",
      playedAt: it.played_at,
    });
  }
  return out;
}
