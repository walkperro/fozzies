import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ApplicantStatus = "new" | "reviewed" | "archived";

export type ApplicantRow = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string;
  availability: string | null;
  message: string;
  website: string | null;
  status: ApplicantStatus;
  admin_note: string | null;
  deleted_at: string | null;
};

const SCHEMA = "fozzies";
const TABLE = "job_applicants";

export async function listApplicants(status?: ApplicantStatus) {
  const supabase = supabaseAdmin();
  let query = supabase
    .schema(SCHEMA)
    .from(TABLE)
    .select("id,created_at,full_name,email,phone,position,availability,message,website,status,admin_note,deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (status) query = query.eq("status", status);
  return query;
}

export async function updateApplicantById(
  id: string,
  updates: Partial<{
    status: ApplicantStatus;
    admin_note: string | null;
    deleted_at: string | null;
  }>
) {
  const supabase = supabaseAdmin();
  return supabase.schema(SCHEMA).from(TABLE).update(updates).eq("id", id).is("deleted_at", null);
}
