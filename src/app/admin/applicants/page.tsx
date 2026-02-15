import Link from "next/link";
import ApplicantsManager from "@/components/admin/ApplicantsManager";
import { listApplicants, type ApplicantStatus } from "@/lib/applicants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status =
    params.status === "new" || params.status === "reviewed" || params.status === "archived"
      ? (params.status as ApplicantStatus)
      : undefined;

  const { data, error } = await listApplicants(status);
  const rows = data ?? [];

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Applicants</h2>
        <p className="mt-2 text-sm text-softgray">Review incoming job applications.</p>
      </div>

      <section className="mt-6 border border-charcoal/10 bg-cream p-5">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/applicants"
            className={`rounded-full border px-3 py-1.5 text-xs ${!status ? "border-gold bg-gold/20 text-charcoal" : "border-charcoal/20 text-softgray"}`}
          >
            All
          </Link>
          {(["new", "reviewed", "archived"] as ApplicantStatus[]).map((value) => (
            <Link
              key={value}
              href={`/admin/applicants?status=${value}`}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize ${status === value ? "border-gold bg-gold/20 text-charcoal" : "border-charcoal/20 text-softgray"}`}
            >
              {value}
            </Link>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">Failed to load applicants.</p> : null}
        {!error && rows.length === 0 ? <p className="mt-4 text-sm text-softgray">No applicants found.</p> : null}
        {!error && rows.length > 0 ? <ApplicantsManager rows={rows} /> : null}
      </section>
    </main>
  );
}
