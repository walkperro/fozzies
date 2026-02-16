import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RangeKey = "24h" | "7d" | "30d";
type GroupKey = "all" | "page" | "conversion" | "admin" | "click";

type AnalyticsEventRow = {
  id: string;
  created_at: string;
  event_type: string;
  page_path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  visitor_id: string | null;
  device: string | null;
  meta: Record<string, unknown> | null;
};

const conversionEvents = new Set(["reservation_submit", "newsletter_signup", "job_application_submit"]);
const clickEvents = new Set(["menu_pdf_open", "click"]);

function getHours(range: RangeKey) {
  if (range === "24h") return 24;
  if (range === "30d") return 24 * 30;
  return 24 * 7;
}

function getReferrerDomain(referrer: string | null) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function formatRangeLabel(range: RangeKey) {
  if (range === "24h") return "Last 24 Hours";
  if (range === "30d") return "Last 30 Days";
  return "Last 7 Days";
}

function inGroup(eventType: string, group: GroupKey) {
  if (group === "all") return true;
  if (group === "page") return eventType === "page_view";
  if (group === "conversion") return conversionEvents.has(eventType);
  if (group === "admin") return eventType.startsWith("admin_");
  if (group === "click") return clickEvents.has(eventType);
  return true;
}

function DataTable({
  title,
  empty,
  headers,
  rows,
}: {
  title: string;
  empty: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section className="border border-charcoal/10 bg-ivory p-5">
      <h3 className="font-serif text-2xl text-charcoal">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-softgray">{empty}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-softgray">
                {headers.map((header) => (
                  <th key={header} className="py-2 pr-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={`${title}-${idx}`} className="border-b border-charcoal/10 align-top">
                  {row.map((cell, cellIdx) => (
                    <td key={`${title}-${idx}-${cellIdx}`} className="py-2 pr-3 text-charcoal">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = (await searchParams) || {};
  const rangeParam = resolved.range;
  const groupParam = resolved.group;
  const range = (typeof rangeParam === "string" && ["24h", "7d", "30d"].includes(rangeParam)
    ? rangeParam
    : "7d") as RangeKey;
  const group = (typeof groupParam === "string" && ["all", "page", "conversion", "admin", "click"].includes(groupParam)
    ? groupParam
    : "all") as GroupKey;

  const sinceDate = new Date();
  sinceDate.setHours(sinceDate.getHours() - getHours(range));
  const since = sinceDate.toISOString();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .schema("fozzies")
    .from("analytics_events")
    .select("id,created_at,event_type,page_path,referrer,utm_source,utm_medium,visitor_id,device,meta")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  const events = (error ? [] : (data || [])) as AnalyticsEventRow[];

  const pageViews = events.filter((e) => e.event_type === "page_view").length;
  const uniqueVisitors = new Set(events.map((e) => e.visitor_id).filter((id): id is string => !!id)).size;
  const conversions = events.filter((e) => conversionEvents.has(e.event_type)).length;

  const topPagesMap = new Map<string, number>();
  const conversionMap = new Map<string, number>();
  const utmMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();

  for (const event of events) {
    if (event.page_path) {
      topPagesMap.set(event.page_path, (topPagesMap.get(event.page_path) || 0) + 1);
    }
    if (conversionEvents.has(event.event_type)) {
      conversionMap.set(event.event_type, (conversionMap.get(event.event_type) || 0) + 1);
    }
    if (event.utm_source || event.utm_medium) {
      const source = event.utm_source || "(direct)";
      const medium = event.utm_medium || "(none)";
      const key = `${source} / ${medium}`;
      utmMap.set(key, (utmMap.get(key) || 0) + 1);
    }
    const domain = getReferrerDomain(event.referrer);
    if (domain) {
      referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
    }
  }

  const topPagesRows = Array.from(topPagesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([path, count]) => [path, String(count)]);

  const utmRows = Array.from(utmMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([sourceMedium, count]) => [sourceMedium, String(count)]);

  const referrerRows = Array.from(referrerMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => [domain, String(count)]);

  const conversionRows = Array.from(conversionMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([eventType, count]) => [eventType, String(count)]);

  const filteredFeed = events.filter((event) => inGroup(event.event_type, group)).slice(0, 50);

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Activity Dashboard</h2>
        <p className="mt-2 text-sm text-softgray">Supabase-powered analytics ({formatRangeLabel(range)}).</p>
      </div>

      <section className="mt-6 flex flex-wrap items-center gap-2">
        {(["24h", "7d", "30d"] as RangeKey[]).map((option) => (
          <Link
            key={option}
            href={`/admin/activity?range=${option}&group=${group}`}
            className={[
              "rounded-full border px-3 py-1 text-xs transition",
              option === range
                ? "border-gold bg-gold/10 text-charcoal"
                : "border-charcoal/20 bg-cream text-softgray hover:bg-charcoal/5",
            ].join(" ")}
          >
            {option.toUpperCase()}
          </Link>
        ))}
      </section>

      {events.length === 0 ? (
        <section className="mt-8 border border-charcoal/10 bg-ivory p-6">
          <p className="text-sm text-softgray">No analytics yet—visit the site to generate traffic.</p>
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">PAGE VIEWS</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{pageViews.toLocaleString()}</div>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">UNIQUE VISITORS</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{uniqueVisitors.toLocaleString()}</div>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">CONVERSIONS</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{conversions.toLocaleString()}</div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <DataTable
              title="Top Pages"
              headers={["Page Path", "Views"]}
              rows={topPagesRows}
              empty="No page views in this range."
            />
            <DataTable
              title="Conversions Breakdown"
              headers={["Event", "Count"]}
              rows={conversionRows}
              empty="No conversion events in this range."
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DataTable
              title="Traffic Sources (UTM)"
              headers={["Source / Medium", "Events"]}
              rows={utmRows}
              empty="No UTM-tagged traffic yet."
            />
            <DataTable
              title="Top Referrers"
              headers={["Referrer Domain", "Events"]}
              rows={referrerRows}
              empty="No referrers recorded yet."
            />
          </div>

          <section className="mt-6 border border-charcoal/10 bg-ivory p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-2xl text-charcoal">Recent Activity</h3>
              <div className="flex flex-wrap gap-2">
                {(["all", "page", "conversion", "click", "admin"] as GroupKey[]).map((option) => (
                  <Link
                    key={option}
                    href={`/admin/activity?range=${range}&group=${option}`}
                    className={[
                      "rounded-full border px-3 py-1 text-xs transition",
                      option === group
                        ? "border-gold bg-gold/10 text-charcoal"
                        : "border-charcoal/20 bg-cream text-softgray hover:bg-charcoal/5",
                    ].join(" ")}
                  >
                    {option === "all" ? "All" : option}
                  </Link>
                ))}
              </div>
            </div>

            {filteredFeed.length === 0 ? (
              <p className="mt-4 text-sm text-softgray">No events match this filter.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-charcoal/10 text-softgray">
                      <th className="py-2 pr-3 font-medium">Time</th>
                      <th className="py-2 pr-3 font-medium">Event</th>
                      <th className="py-2 pr-3 font-medium">Path</th>
                      <th className="py-2 pr-3 font-medium">Visitor</th>
                      <th className="py-2 pr-3 font-medium">Device</th>
                      <th className="py-2 pr-3 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeed.map((event) => (
                      <tr key={event.id} className="border-b border-charcoal/10 align-top">
                        <td className="py-2 pr-3 text-softgray">{new Date(event.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-3 text-charcoal">{event.event_type}</td>
                        <td className="py-2 pr-3 text-charcoal">{event.page_path || "—"}</td>
                        <td className="py-2 pr-3 text-softgray">{event.visitor_id || "—"}</td>
                        <td className="py-2 pr-3 text-softgray">{event.device || "—"}</td>
                        <td className="py-2 pr-3 text-softgray">
                          {event.utm_source || event.utm_medium
                            ? `${event.utm_source || "(direct)"} / ${event.utm_medium || "(none)"}`
                            : getReferrerDomain(event.referrer) || "Direct"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
