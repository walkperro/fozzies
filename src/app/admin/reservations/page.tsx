import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminReservationsTable from "@/components/admin/AdminReservationsTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .schema("fozzies")
    .from("reservations")
    .select("id,created_at,name,email,phone,party_size,date,time,notes,status,source, archived_at, deleted_at")
    .filter("deleted_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(250);

  const rows = data ?? [];

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Reservations</h2>
        <p className="mt-2 text-sm text-softgray">Latest requests from the website form.</p>
      </div>

      <div className="mt-8 border border-charcoal/10 bg-cream shadow-sm">
        {error ? (
          <div className="p-5 text-sm text-red-700">Failed to load: {error.message}</div>
        ) : (
          <AdminReservationsTable initialRows={rows} />
        )}
      </div>
    </main>
  );
}
