import { revalidatePath } from "next/cache";
import ClientsBlastForm from "@/components/admin/ClientsBlastForm";
import { addClient, countBlastRecipients, listClients } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BlastState = { ok: boolean; recipients: number; error?: string };

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

  async function sendBlastAction(_: BlastState, formData: FormData): Promise<BlastState> {
    "use server";

    const subject = String(formData.get("subject") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!subject || !body) return { ok: false, recipients: 0, error: "Subject and body are required." };

    const { count } = await countBlastRecipients();
    const recipients = count ?? 0;

    console.log("TODO: integrate newsletter provider send", {
      recipients,
      subject,
      preview: body.slice(0, 160),
    });

    return { ok: true, recipients };
  }

  const { data, error } = await listClients();
  const rows = data ?? [];

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Clients</h2>
        <p className="mt-2 text-sm text-softgray">Newsletter list management and blast skeleton flow.</p>
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
          <h3 className="font-serif text-2xl text-charcoal">Send Blast (Stub)</h3>
          <ClientsBlastForm action={sendBlastAction} />
          <div className="mt-4 text-xs text-softgray">
            TODO: integrate provider (Resend/Postmark/etc), add unsubscribe links, suppression list checks, and legal compliance
            (CAN-SPAM/GDPR) before production send.
          </div>
        </div>
      </section>

      <section className="mt-6 border border-charcoal/10 bg-cream p-5">
        <h3 className="font-serif text-2xl text-charcoal">Client List</h3>
        {error ? <p className="mt-3 text-sm text-red-700">Failed to load: {error.message}</p> : null}
        {!error && rows.length === 0 ? <p className="mt-3 text-sm text-softgray">No clients yet.</p> : null}
        {!error && rows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-softgray">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Created</th>
                  <th className="py-2 pr-3 font-medium">Unsubscribed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-charcoal/10">
                    <td className="py-2 pr-3 text-charcoal">{row.name || "—"}</td>
                    <td className="py-2 pr-3 text-charcoal">{row.email}</td>
                    <td className="py-2 pr-3 text-softgray">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-charcoal">{row.unsubscribed ? "Yes" : "No"}</td>
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
