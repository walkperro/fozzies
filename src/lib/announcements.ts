import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Announcement = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  body: string;
  pinned: boolean;
  is_published: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

const SCHEMA = "fozzies";
const TABLE = "announcements";

function isActiveNow(row: Announcement, nowMs: number) {
  if (row.starts_at) {
    const starts = new Date(row.starts_at).getTime();
    if (!Number.isNaN(starts) && starts > nowMs) return false;
  }
  if (row.ends_at) {
    const ends = new Date(row.ends_at).getTime();
    if (!Number.isNaN(ends) && ends < nowMs) return false;
  }
  return true;
}

export async function listAnnouncementsForAdmin() {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,created_at,updated_at,title,body,pinned,is_published,starts_at,ends_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
}

export async function listPublicAnnouncements(limit = 3) {
  const supabase = supabaseAdmin();
  const safeLimit = Math.min(Math.max(limit, 1), 25);
  const nowMs = Date.now();

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,created_at,updated_at,title,body,pinned,is_published,starts_at,ends_at")
    .eq("is_published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return { data: null, error };

  const visible = (data ?? []).filter((row) => isActiveNow(row as Announcement, nowMs)).slice(0, safeLimit);
  return { data: visible, error: null };
}

export async function createAnnouncement(input: {
  title: string;
  body: string;
  pinned: boolean;
  is_published: boolean;
  starts_at: string | null;
  ends_at: string | null;
}) {
  const supabase = supabaseAdmin();
  return supabase.schema(SCHEMA).from(TABLE).insert(input);
}

export async function updateAnnouncement(
  id: string,
  input: {
    title: string;
    body: string;
    pinned: boolean;
    is_published: boolean;
    starts_at: string | null;
    ends_at: string | null;
  }
) {
  const supabase = supabaseAdmin();
  return supabase
    .schema(SCHEMA)
    .from(TABLE)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function deleteAnnouncement(id: string) {
  const supabase = supabaseAdmin();
  return supabase.schema(SCHEMA).from(TABLE).delete().eq("id", id);
}
