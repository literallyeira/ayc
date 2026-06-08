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
