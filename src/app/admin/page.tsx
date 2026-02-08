import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminReservationsTable from "@/components/admin/AdminReservationsTable";

export const runtime = "nodejs";

export default async function AdminPage() {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .schema("fozzies")
    .from("reservations")
    .is("deleted_at", null)
    .select("id,created_at,name,email,phone,party_size,date,time,notes,status,source, archived_at, deleted_at")
    .order("created_at", { ascending: false })
    .limit(250);

  const rows = data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
          <h1 className="mt-2 font-serif text-4xl text-charcoal">Reservations</h1>
          <p className="mt-2 text-sm text-softgray">
            Latest requests from the website form.
          </p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button className="rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15">
            Log out
          </button>
        </form>
      </div>

      <div className="mt-8 border border-charcoal/10 bg-cream shadow-sm">
        {error ? (
          <div className="p-5 text-sm text-red-700">
            Failed to load: {error.message}
          </div>
        ) : (
          <AdminReservationsTable initialRows={rows} />
        )}
      </div>
    </main>
  );
}
