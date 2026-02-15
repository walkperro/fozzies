import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SCHEMA = "fozzies";
const TABLE = "site_settings";

export async function getSettingValue<T>(key: string): Promise<T | null> {
  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function upsertSettingValue<T>(key: string, value: T) {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}
