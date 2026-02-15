import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ClientRow = {
  id: string;
  created_at: string;
  name: string | null;
  email: string;
  unsubscribed: boolean;
};

const SCHEMA = "fozzies";
const TABLE = "clients";

export async function listClients() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,created_at,name,email,unsubscribed")
    .order("created_at", { ascending: false })
    .limit(500);
}

export async function addClient(input: { name: string | null; email: string }) {
  const supabase = supabaseAdmin();
  return supabase.schema(SCHEMA).from(TABLE).insert(input);
}

export async function countBlastRecipients() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("unsubscribed", false);
}
