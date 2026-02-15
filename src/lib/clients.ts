import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ClientRow = {
  id: string;
  created_at: string;
  name: string | null;
  email: string;
  unsubscribed: boolean;
  unsubscribed_at: string | null;
  suppressed: boolean;
  suppressed_reason: string | null;
  suppressed_at: string | null;
  unsubscribe_token: string | null;
};

const SCHEMA = "fozzies";
const TABLE = "clients";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateUnsubscribeToken() {
  return randomBytes(32).toString("base64url");
}

export async function listClients() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,created_at,name,email,unsubscribed,unsubscribed_at,suppressed,suppressed_reason,suppressed_at,unsubscribe_token")
    .order("created_at", { ascending: false })
    .limit(500);
}

export async function addClient(input: { name: string | null; email: string }) {
  const supabase = supabaseAdmin();
  return supabase.schema(SCHEMA).from(TABLE).insert({
    name: input.name,
    email: normalizeEmail(input.email),
    unsubscribed: false,
    unsubscribe_token: generateUnsubscribeToken(),
  });
}

export async function findClientByEmail(email: string) {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,email,unsubscribed,unsubscribed_at,suppressed,suppressed_reason,suppressed_at,unsubscribe_token")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
}

export async function findClientByToken(token: string) {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,email,unsubscribed,suppressed,suppressed_reason")
    .eq("unsubscribe_token", token)
    .maybeSingle();
}

export async function upsertClientSubscription(input: { email: string; name: string | null }) {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .upsert(
      {
        email: normalizeEmail(input.email),
        name: input.name,
        unsubscribe_token: generateUnsubscribeToken(),
      },
      { onConflict: "email", ignoreDuplicates: true }
    );
}

export async function updateClientById(
  id: string,
  updates: Partial<{
    name: string | null;
    unsubscribed: boolean;
    unsubscribed_at: string | null;
    suppressed: boolean;
    suppressed_reason: string | null;
    suppressed_at: string | null;
    unsubscribe_token: string | null;
  }>
) {
  const supabase = supabaseAdmin();
  return supabase.schema(SCHEMA).from(TABLE).update(updates).eq("id", id);
}

export async function unsubscribeClientByToken(token: string) {
  const supabase = supabaseAdmin();
  const now = new Date().toISOString();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .update({
      unsubscribed: true,
      unsubscribed_at: now,
      suppressed: true,
      suppressed_reason: "unsubscribed",
      suppressed_at: now,
    })
    .eq("unsubscribe_token", token);
}

export async function suppressClientByEmail(email: string, reason: "hard_bounce" | "complaint" | "manual") {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .update({
      suppressed: true,
      suppressed_reason: reason,
      suppressed_at: new Date().toISOString(),
    })
    .eq("email", normalizeEmail(email));
}

export async function listBlastRecipients() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,email,unsubscribe_token")
    .eq("unsubscribed", false)
    .eq("suppressed", false)
    .order("created_at", { ascending: false })
    .limit(5000);
}

export async function countBlastRecipients() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("unsubscribed", false)
    .eq("suppressed", false);
}

export async function logEmailEvent(event: { type: string; email?: string | null; payload: unknown }) {
  const supabase = supabaseAdmin();
  return supabase.schema(SCHEMA).from("email_events").insert({
    type: event.type,
    email: event.email ? normalizeEmail(event.email) : null,
    payload: event.payload,
  });
}
