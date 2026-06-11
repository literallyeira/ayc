import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AppState } from "./types";

// Supabase yalnızca ortam değişkenleri tanımlıysa devreye girer.
// Tanımlı değilse uygulama localStorage ile (tek cihaz) sorunsuz çalışır.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isCloud = Boolean(url && anon);

const ROW_ID = "main";
const DRAW_ID = "drawings";
const TABLE = "app_state";

export interface DrawingsDoc {
  updatedAt: number;
  items: Record<string, string>; // yyyy-mm-dd -> dataURL
}

let client: SupabaseClient | null = null;
if (isCloud) {
  client = createClient(url as string, anon as string, {
    auth: { persistSession: false },
  });
}

export async function loadRemote(): Promise<AppState | null> {
  if (!client) return null;
  const { data, error } = await client
    .from(TABLE)
    .select("data")
    .eq("id", ROW_ID)
    .maybeSingle();
  if (error) {
    console.warn("[sync] uzaktan yükleme hatası:", error.message);
    return null;
  }
  return (data?.data as AppState) ?? null;
}

export async function saveRemote(state: AppState): Promise<boolean> {
  if (!client) return false;
  const { error } = await client
    .from(TABLE)
    .upsert({ id: ROW_ID, data: state, updated_at: state.updatedAt });
  if (error) {
    console.warn("[sync] uzaktan kaydetme hatası:", error.message);
    return false;
  }
  return true;
}

// Sayfa kapanırken/gizlenirken bekleyen kaydı kaçırmamak için keepalive ile yaz.
// (supabase-js fetch'i keepalive desteklemiyor; PostgREST'e doğrudan gidiyoruz.)
export function saveRemoteKeepalive(state: AppState): void {
  if (!isCloud) return;
  try {
    const body = JSON.stringify({
      id: ROW_ID,
      data: state,
      updated_at: state.updatedAt,
    });
    // keepalive istek gövdesi ~64KB ile sınırlı; aşıyorsa normal kanala bırak
    if (body.length > 60_000) {
      void saveRemote(state);
      return;
    }
    fetch(`${url}/rest/v1/${TABLE}?on_conflict=id`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: anon as string,
        Authorization: `Bearer ${anon}`,
        Prefer: "resolution=merge-duplicates",
      },
      body,
    }).catch(() => {});
  } catch {
    /* sessizce geç */
  }
}

// Çizimler ayrı satırda (id='drawings') tutulur — ana veriyi şişirmemek için.
export async function loadRemoteDrawings(): Promise<DrawingsDoc | null> {
  if (!client) return null;
  const { data, error } = await client
    .from(TABLE)
    .select("data")
    .eq("id", DRAW_ID)
    .maybeSingle();
  if (error) {
    console.warn("[sync] çizim yükleme hatası:", error.message);
    return null;
  }
  return (data?.data as DrawingsDoc) ?? null;
}

export async function saveRemoteDrawings(doc: DrawingsDoc): Promise<boolean> {
  if (!client) return false;
  const { error } = await client
    .from(TABLE)
    .upsert({ id: DRAW_ID, data: doc, updated_at: doc.updatedAt });
  if (error) {
    console.warn("[sync] çizim kaydetme hatası:", error.message);
    return false;
  }
  return true;
}
