import { revalidatePath } from "next/cache";
import ClientsBlastForm from "@/components/admin/ClientsBlastForm";
import ClientRowActions from "@/components/admin/ClientRowActions";
import { addClient, listClients } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function StatusBadge({ label, tone }: { label: string; tone: "active" | "unsubscribed" | "suppressed" }) {
  const toneClass =
    tone === "active"
      ? "border-gold/40 bg-gold/10 text-charcoal"
      : tone === "unsubscribed"
        ? "border-charcoal/20 bg-charcoal/5 text-charcoal"
        : "border-charcoal/30 bg-charcoal/10 text-charcoal";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${toneClass}`}>{label}</span>;
}

export default async function AdminClientsPage() {
  async function addClientAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    if (!email) return;

    await addClient({ name: name || null, email });
    revalidatePath("/admin/clients");
  }

  const { data, error } = await listClients();
  const rows = data ?? [];
  const blastEnabled = Boolean(process.env.RESEND_API_KEY && (process.env.RESEND_FROM ?? process.env.FROM_EMAIL));

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Clients</h2>
        <p className="mt-2 text-sm text-softgray">Newsletter list management and blast sending.</p>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="border border-charcoal/10 bg-ivory p-5">
          <h3 className="font-serif text-2xl text-charcoal">Add Client</h3>
          <form action={addClientAction} className="mt-4 grid gap-4">
            <div>
              <label className="block text-[11px] tracking-[0.18em] text-softgray">NAME (OPTIONAL)</label>
              <input
                name="name"
                className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.18em] text-softgray">EMAIL</label>
              <input
                type="email"
                name="email"
                required
                className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
              />
            </div>
            <button className="w-fit rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90">
              Add Client
            </button>
          </form>
        </div>

        <div className="border border-charcoal/10 bg-ivory p-5">
          <h3 className="font-serif text-2xl text-charcoal">Send Blast</h3>
          <ClientsBlastForm blastEnabled={blastEnabled} />
          <div className="mt-4 text-xs text-softgray">Campaigns automatically skip unsubscribed and suppressed recipients.</div>
        </div>
      </section>

      <section className="mt-6 border border-charcoal/10 bg-cream p-5">
        <h3 className="font-serif text-2xl text-charcoal">Client List</h3>
        {error ? <p className="mt-3 text-sm text-red-700">Failed to load: {error.message}</p> : null}
        {!error && rows.length === 0 ? <p className="mt-3 text-sm text-softgray">No clients yet.</p> : null}
        {!error && rows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-softgray">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Created</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-charcoal/10 align-top">
                    <td className="py-2 pr-3 text-charcoal">
                      <ClientRowActions
                        id={row.id}
                        initialName={row.name}
                        initialUnsubscribed={row.unsubscribed}
                        initialSuppressed={row.suppressed}
                        initialSuppressedReason={row.suppressed_reason}
                      />
                    </td>
                    <td className="py-2 pr-3 text-charcoal">{row.email}</td>
                    <td className="py-2 pr-3 text-softgray">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-charcoal">
                      <div className="flex flex-wrap gap-2">
                        {!row.unsubscribed && !row.suppressed ? <StatusBadge label="Active" tone="active" /> : null}
                        {row.unsubscribed ? <StatusBadge label="Unsubscribed" tone="unsubscribed" /> : null}
                        {row.suppressed ? (
                          <StatusBadge label={`Suppressed: ${row.suppressed_reason || "manual"}`} tone="suppressed" />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
