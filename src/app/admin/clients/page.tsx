import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import ClientsBlastForm from "@/components/admin/ClientsBlastForm";
import ClientRowActions from "@/components/admin/ClientRowActions";
import { addClient, listBlastRecipients, listClients } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BlastState = {
  ok: boolean;
  sentCount?: number;
  recipients: number;
  failedCount: number;
  failures: Array<{ email: string; errorMessage: string }>;
  mode?: "blast" | "test";
  message?: string;
  hint?: string;
  error?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeErrorMessage(value: unknown) {
  const base =
    typeof value === "string"
      ? value
      : value instanceof Error
        ? value.message
        : "Unknown provider error";
  return base.replace(/\s+/g, " ").trim().slice(0, 220);
}

function configHintFromFailures(failures: Array<{ email: string; errorMessage: string }>) {
  const combined = failures.map((f) => f.errorMessage).join(" ").toLowerCase();
  if (/verify|verified|domain|sender|from address|from email/.test(combined)) {
    return "Verify RESEND_FROM domain in Resend.";
  }
  return undefined;
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

  async function sendBlastAction(_: BlastState, formData: FormData): Promise<BlastState> {
    "use server";

    const sendMode = String(formData.get("sendMode") ?? "blast") === "test" ? "test" : "blast";
    const subject = String(formData.get("subject") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!subject || !body) {
      return { ok: false, recipients: 0, failedCount: 0, failures: [], error: "Subject and body are required." };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM ?? process.env.FROM_EMAIL;
    if (!apiKey || !from) {
      return {
        ok: false,
        sentCount: 0,
        recipients: 0,
        failedCount: 0,
        failures: [],
        error: "Set RESEND_API_KEY and RESEND_FROM to enable blasts.",
      };
    }

    const resend = new Resend(apiKey);

    const sendOne = async (email: string) => {
      try {
        const { error: sendError } = await resend.emails.send({
          from,
          to: email,
          subject,
          text: body,
        });

        if (sendError) {
          console.error("Blast send failed", { email, sendError });
          return {
            ok: false as const,
            email,
            errorMessage: sanitizeErrorMessage(sendError.message),
          };
        }

        return { ok: true as const, email };
      } catch (err) {
        console.error("Blast send threw", { email, err });
        return {
          ok: false as const,
          email,
          errorMessage: sanitizeErrorMessage(err),
        };
      }
    };

    if (sendMode === "test") {
      const testEmail = String(formData.get("testEmail") ?? "").trim().toLowerCase();
      if (!isValidEmail(testEmail)) {
        return {
          ok: false,
          sentCount: 0,
          recipients: 0,
          failedCount: 0,
          failures: [],
          mode: "test",
          error: "Enter a valid test email.",
        };
      }

      const result = await sendOne(testEmail);
      if (!result.ok) {
        const failures = [{ email: result.email, errorMessage: result.errorMessage }];
        return {
          ok: false,
          sentCount: 0,
          recipients: 0,
          failedCount: 1,
          failures,
          mode: "test",
          hint: configHintFromFailures(failures),
          error: `Test send failed: ${result.errorMessage}`,
        };
      }

      return {
        ok: true,
        sentCount: 1,
        recipients: 1,
        failedCount: 0,
        failures: [],
        mode: "test",
        message: `Test sent to ${testEmail}.`,
      };
    }

    const { data, error } = await listBlastRecipients();
    if (error) {
      return { ok: false, recipients: 0, failedCount: 0, failures: [], error: "Could not load recipients." };
    }

    const recipients = (data ?? []).map((row) => row.email).filter(Boolean);
    if (recipients.length === 0) {
      return {
        ok: true,
        sentCount: 0,
        recipients: 0,
        failedCount: 0,
        failures: [],
        mode: "blast",
        message: "Sent to 0 recipients.",
      };
    }

    const concurrency = 3;
    let sentCount = 0;
    const failures: Array<{ email: string; errorMessage: string }> = [];

    for (let i = 0; i < recipients.length; i += concurrency) {
      const chunk = recipients.slice(i, i + concurrency);
      const results = await Promise.all(chunk.map((email) => sendOne(email)));
      for (const result of results) {
        if (result.ok) {
          sentCount += 1;
        } else {
          failures.push({ email: result.email, errorMessage: result.errorMessage });
        }
      }
    }

    return {
      ok: true,
      sentCount,
      recipients: sentCount,
      failedCount: failures.length,
      failures: failures.slice(0, 5),
      hint: configHintFromFailures(failures),
      mode: "blast",
      message: `Sent to ${sentCount} recipients.`,
    };
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
          <ClientsBlastForm action={sendBlastAction} blastEnabled={blastEnabled} />
          <div className="mt-4 text-xs text-softgray">
            Include unsubscribe links and suppression-list checks before production campaigns.
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
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-charcoal/10">
                    <td className="py-2 pr-3 text-charcoal">
                      <ClientRowActions id={row.id} initialName={row.name} initialUnsubscribed={row.unsubscribed} />
                    </td>
                    <td className="py-2 pr-3 text-charcoal">{row.email}</td>
                    <td className="py-2 pr-3 text-softgray">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-charcoal">{row.unsubscribed ? "Unsubscribed" : "Subscribed"}</td>
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
