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

export async function findClientByEmail(email: string) {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,email,unsubscribed")
    .eq("email", email)
    .maybeSingle();
}

export async function upsertClientSubscription(input: { email: string; name: string | null }) {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .upsert(
      {
        email: input.email,
        name: input.name,
        unsubscribed: false,
      },
      { onConflict: "email" }
    );
}

export async function countBlastRecipients() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("unsubscribed", false);
}

export async function listBlastRecipients() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("email")
    .eq("unsubscribed", false)
    .order("created_at", { ascending: false })
    .limit(5000);
}
