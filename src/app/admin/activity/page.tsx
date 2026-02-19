import Link from "next/link";
import UtmLinkBuilder from "@/components/admin/UtmLinkBuilder";
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
  city: string | null;
  region: string | null;
  country: string | null;
  meta: Record<string, unknown> | null;
};

const majorConversionEvents = new Set(["reservation_submit"]);
const secondaryConversionEvents = new Set(["newsletter_signup", "job_application_submit"]);
const engagementEvents = new Set(["menu_pdf_open"]);
const allConversionEvents = new Set([...majorConversionEvents, ...secondaryConversionEvents]);
const clickEvents = new Set(["menu_pdf_open", "click"]);

const friendlyPathMap: Record<string, string> = {
  "/": "Home",
  "/menu": "Menu",
  "/about": "About",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/join-the-team": "Join the Team",
  "/privacy": "Privacy Policy",
};

const friendlyEventMap: Record<string, string> = {
  page_view: "Visited page",
  menu_pdf_open: "Opened menu PDF",
  newsletter_signup: "Joined email list",
  reservation_submit: "Reservation request",
  job_application_submit: "Job application",
  admin_login: "Admin: Login",
  admin_logout: "Admin: Logout",
  admin_pdf_upload: "Admin: Uploaded menu PDF",
};

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

function formatEventLabel(eventType: string) {
  return friendlyEventMap[eventType] || eventType;
}

function formatPathLabel(path: string | null) {
  if (!path) return "—";
  const basePath = path.split("?")[0]?.split("#")[0] || path;
  return friendlyPathMap[basePath] || path;
}

function isAdminPath(path: string | null) {
  return !!path && path.startsWith("/admin");
}

function inGroup(eventType: string, group: GroupKey) {
  if (group === "all") return true;
  if (group === "page") return eventType === "page_view";
  if (group === "conversion") return allConversionEvents.has(eventType) || engagementEvents.has(eventType);
  if (group === "admin") return eventType.startsWith("admin_");
  if (group === "click") return clickEvents.has(eventType);
  return true;
}

function normalizeDeviceLabel(value: string | null) {
  const normalized = (value || "unknown").toLowerCase();
  if (normalized === "mobile" || normalized === "desktop" || normalized === "tablet") return normalized;
  return "other";
}

function formatDeviceLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function reservationSourceLabel(event: AnalyticsEventRow) {
  if (event.utm_source) {
    return event.utm_medium ? `${event.utm_source} / ${event.utm_medium}` : event.utm_source;
  }
  return getReferrerDomain(event.referrer) || "Direct / Unknown";
}

function reservationCityLabel(event: AnalyticsEventRow) {
  if (!event.city) return "Unknown";
  return `${event.city}${event.region ? `, ${event.region}` : ""}${event.country ? ` (${event.country})` : ""}`;
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
        <div className="mt-4 overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-softgray">
                {headers.map((header, idx) => (
                  <th
                    key={header}
                    className={[
                      "px-3 py-2 font-medium",
                      idx === headers.length - 1 ? "whitespace-nowrap pr-4 text-right tabular-nums" : "",
                    ].join(" ")}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={`${title}-${idx}`} className="border-b border-charcoal/10 align-top">
                  {row.map((cell, cellIdx) => (
                    <td
                      key={`${title}-${idx}-${cellIdx}`}
                      className={[
                        "px-3 py-2 text-charcoal",
                        cellIdx === row.length - 1 ? "whitespace-nowrap pr-4 text-right tabular-nums" : "",
                      ].join(" ")}
                    >
                      <span
                        className={cellIdx === row.length - 1 ? "whitespace-nowrap" : "break-words"}
                        title={cell}
                      >
                        {cell}
                      </span>
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
  const includeAdminParam = resolved.include_admin;
  const range = (typeof rangeParam === "string" && ["24h", "7d", "30d"].includes(rangeParam)
    ? rangeParam
    : "7d") as RangeKey;
  const group = (typeof groupParam === "string" && ["all", "page", "conversion", "admin", "click"].includes(groupParam)
    ? groupParam
    : "all") as GroupKey;
  const includeAdminTraffic = includeAdminParam === "1";

  const sinceDate = new Date();
  sinceDate.setHours(sinceDate.getHours() - getHours(range));
  const since = sinceDate.toISOString();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .schema("fozzies")
    .from("analytics_events")
    .select("id,created_at,event_type,page_path,referrer,utm_source,utm_medium,visitor_id,device,city,region,country,meta")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  const events = (error ? [] : (data || [])) as AnalyticsEventRow[];
  const summaryEvents = includeAdminTraffic
    ? events
    : events.filter((event) => !isAdminPath(event.page_path) && !event.event_type.startsWith("admin_"));
  const pageViewEvents = summaryEvents.filter((event) => event.event_type === "page_view");

  const totalPageViews = pageViewEvents.length;
  const uniqueVisitors = new Set(pageViewEvents.map((e) => e.visitor_id).filter((id): id is string => !!id)).size;

  const reservationCount = summaryEvents.filter((e) => majorConversionEvents.has(e.event_type)).length;
  const newsletterCount = summaryEvents.filter((e) => e.event_type === "newsletter_signup").length;
  const jobAppCount = summaryEvents.filter((e) => e.event_type === "job_application_submit").length;
  const menuOpenCount = summaryEvents.filter((e) => e.event_type === "menu_pdf_open").length;

  const actionsTaken = reservationCount + newsletterCount + jobAppCount;
  const conversionRate = uniqueVisitors > 0 ? (reservationCount / uniqueVisitors) * 100 : 0;

  const topPagesMap = new Map<string, number>();
  const conversionMap = new Map<string, number>();
  const topActionsMap = new Map<string, number>();
  const utmMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const cityVisitorsMap = new Map<string, Set<string>>();

  for (const event of summaryEvents) {
    if (event.event_type === "page_view" && event.page_path) {
      topPagesMap.set(event.page_path, (topPagesMap.get(event.page_path) || 0) + 1);
    }

    if (allConversionEvents.has(event.event_type)) {
      conversionMap.set(event.event_type, (conversionMap.get(event.event_type) || 0) + 1);
    }

    if (event.event_type !== "page_view") {
      topActionsMap.set(event.event_type, (topActionsMap.get(event.event_type) || 0) + 1);
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

    if (event.event_type === "page_view") {
      const normalizedDevice = normalizeDeviceLabel(event.device);
      deviceMap.set(normalizedDevice, (deviceMap.get(normalizedDevice) || 0) + 1);

      if (event.city && event.visitor_id) {
        const cityLabel = `${event.city}${event.region ? `, ${event.region}` : ""}${event.country ? ` (${event.country})` : ""}`;
        const set = cityVisitorsMap.get(cityLabel) || new Set<string>();
        set.add(event.visitor_id);
        cityVisitorsMap.set(cityLabel, set);
      }
    }
  }

  const topPagesRows = Array.from(topPagesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([path, count]) => [formatPathLabel(path), String(count)]);

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
    .map(([eventType, count]) => [formatEventLabel(eventType), String(count)]);

  const topActionsRows = Array.from(topActionsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([eventType, count]) => [formatEventLabel(eventType), String(count)]);

  const deviceRows = Array.from(deviceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([device, count]) => {
      const pct = totalPageViews > 0 ? (count / totalPageViews) * 100 : 0;
      const label = device.charAt(0).toUpperCase() + device.slice(1);
      return [label, String(count), `${pct.toFixed(1)}%`];
    });

  const topCitiesRows = Array.from(cityVisitorsMap.entries())
    .map(([city, visitorSet]) => [city, String(visitorSet.size)] as [string, string])
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 10);

  const filteredFeed = events.filter((event) => inGroup(event.event_type, group)).slice(0, 50);
  const reservationEvents = summaryEvents.filter((event) => event.event_type === "reservation_submit");

  const reservationsBySourceMap = new Map<string, number>();
  const reservationsByCityMap = new Map<string, number>();
  const visitorIdsByDevice = new Map<string, Set<string>>();
  const reservationByDeviceMap = new Map<string, number>();

  for (const event of reservationEvents) {
    const sourceLabel = reservationSourceLabel(event);
    reservationsBySourceMap.set(sourceLabel, (reservationsBySourceMap.get(sourceLabel) || 0) + 1);

    const cityLabel = reservationCityLabel(event);
    reservationsByCityMap.set(cityLabel, (reservationsByCityMap.get(cityLabel) || 0) + 1);

    const reservationDevice = normalizeDeviceLabel(event.device);
    reservationByDeviceMap.set(reservationDevice, (reservationByDeviceMap.get(reservationDevice) || 0) + 1);
  }

  for (const event of pageViewEvents) {
    if (!event.visitor_id) continue;
    const device = normalizeDeviceLabel(event.device);
    const ids = visitorIdsByDevice.get(device) || new Set<string>();
    ids.add(event.visitor_id);
    visitorIdsByDevice.set(device, ids);
  }

  const reservationsBySourceRows = Array.from(reservationsBySourceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => [source, String(count)]);

  const reservationsByCityRows = Array.from(reservationsByCityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, count]) => [city, String(count)]);

  const conversionByDeviceRows = Array.from(
    new Set([...Array.from(visitorIdsByDevice.keys()), ...Array.from(reservationByDeviceMap.keys())])
  )
    .map((device) => {
      const visitors = visitorIdsByDevice.get(device)?.size || 0;
      const reservations = reservationByDeviceMap.get(device) || 0;
      const rate = visitors > 0 ? `${((reservations / visitors) * 100).toFixed(1)}%` : "—";
      return [formatDeviceLabel(device), String(visitors), String(reservations), rate] as string[];
    })
    .sort((a, b) => Number(b[2]) - Number(a[2]));

  return (
    <main className="max-w-full overflow-x-hidden">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Activity Dashboard</h2>
        <p className="mt-2 text-sm text-softgray">Supabase-powered analytics ({formatRangeLabel(range)}).</p>
      </div>

      <section className="mt-6 flex flex-wrap items-center gap-2">
        {(["24h", "7d", "30d"] as RangeKey[]).map((option) => (
          <Link
            key={option}
            href={`/admin/activity?range=${option}&group=${group}${includeAdminTraffic ? "&include_admin=1" : ""}`}
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
        <Link
          href={`/admin/activity?range=${range}&group=${group}${includeAdminTraffic ? "" : "&include_admin=1"}`}
          className={[
            "rounded-full border px-3 py-1 text-xs transition",
            includeAdminTraffic
              ? "border-gold bg-gold/10 text-charcoal"
              : "border-charcoal/20 bg-cream text-softgray hover:bg-charcoal/5",
          ].join(" ")}
        >
          Include admin traffic
        </Link>
      </section>

      <section className="mt-6 border border-charcoal/10 bg-ivory p-5">
        <h3 className="font-serif text-2xl text-charcoal">How to read this</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-softgray">
          <li><span className="text-charcoal">Total Page Views</span> counts every page load.</li>
          <li><span className="text-charcoal">People Who Visited</span> counts different devices that visited.</li>
          <li><span className="text-charcoal">Actions Taken</span> counts reservations, email signups, and job applications.</li>
        </ul>
      </section>

      {events.length === 0 ? (
        <section className="mt-8 border border-charcoal/10 bg-ivory p-6">
          <p className="text-sm text-softgray">No analytics yet—visit the site to generate traffic.</p>
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">TOTAL PAGE VIEWS</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{totalPageViews.toLocaleString()}</div>
              <p className="mt-2 text-xs text-softgray">All page loads.</p>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">PEOPLE WHO VISITED</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{uniqueVisitors.toLocaleString()}</div>
              <p className="mt-2 text-xs text-softgray">Different devices that visited.</p>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">ACTIONS TAKEN</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{actionsTaken.toLocaleString()}</div>
              <p className="mt-2 text-xs text-softgray">Reservations + signups + job applications.</p>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">ENGAGEMENT</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{menuOpenCount.toLocaleString()}</div>
              <p className="mt-2 text-xs text-softgray">Menu PDF opens.</p>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-5">
              <div className="text-xs tracking-[0.16em] text-softgray">CONVERSION RATE</div>
              <div className="mt-2 font-serif text-4xl text-charcoal">{conversionRate.toFixed(1)}%</div>
              <p className="mt-2 text-xs text-softgray">Reservations ÷ People Who Visited.</p>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-charcoal/10 bg-ivory p-4">
              <div className="text-xs tracking-[0.16em] text-softgray">RESERVATIONS</div>
              <div className="mt-2 font-serif text-3xl text-charcoal">{reservationCount.toLocaleString()}</div>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-4">
              <div className="text-xs tracking-[0.16em] text-softgray">NEWSLETTER</div>
              <div className="mt-2 font-serif text-3xl text-charcoal">{newsletterCount.toLocaleString()}</div>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-4">
              <div className="text-xs tracking-[0.16em] text-softgray">JOB APPLICATIONS</div>
              <div className="mt-2 font-serif text-3xl text-charcoal">{jobAppCount.toLocaleString()}</div>
            </div>
            <div className="border border-charcoal/10 bg-ivory p-4">
              <div className="text-xs tracking-[0.16em] text-softgray">MENU OPENS</div>
              <div className="mt-2 font-serif text-3xl text-charcoal">{menuOpenCount.toLocaleString()}</div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <DataTable
              title="Top Pages"
              headers={["Page", "Views"]}
              rows={topPagesRows}
              empty="No page views in this range."
            />
            <DataTable
              title="Conversions Breakdown"
              headers={["Action", "Count"]}
              rows={conversionRows}
              empty="No conversion events in this range."
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DataTable
              title="Top Actions"
              headers={["Action", "Count"]}
              rows={topActionsRows}
              empty="No tracked actions yet."
            />
            <section className="border border-charcoal/10 bg-ivory p-5">
              <h3 className="font-serif text-2xl text-charcoal">Device Split</h3>
              <p className="mt-2 text-sm text-softgray">Device is estimated from the browser&apos;s user-agent.</p>
              {deviceRows.length === 0 ? (
                <p className="mt-4 text-sm text-softgray">No device data in this range.</p>
              ) : (
                <div className="mt-4 overflow-x-auto -mx-5 px-5">
                  <table className="w-full min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-charcoal/10 text-softgray">
                        <th className="px-3 py-2 font-medium">Device</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap pr-4 text-right tabular-nums">Count</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap pr-4 text-right tabular-nums">Percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviceRows.map((row) => (
                        <tr key={row[0]} className="border-b border-charcoal/10 align-top">
                          <td className="px-3 py-2 text-charcoal break-words" title={row[0]}>{row[0]}</td>
                          <td className="px-3 py-2 whitespace-nowrap pr-4 text-right tabular-nums text-charcoal">{row[1]}</td>
                          <td className="px-3 py-2 whitespace-nowrap pr-4 text-right tabular-nums text-charcoal">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
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
              headers={["Referrer", "Events"]}
              rows={referrerRows}
              empty="No referrers recorded yet."
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="border border-charcoal/10 bg-ivory p-5">
              <h3 className="font-serif text-2xl text-charcoal">Top Cities</h3>
              {topCitiesRows.length === 0 ? (
                <div className="mt-4 space-y-2 text-sm text-softgray">
                  <p>No city data yet.</p>
                  <p>City may be unavailable if the platform doesn&apos;t provide geo headers.</p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto -mx-5 px-5">
                  <table className="w-full min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-charcoal/10 text-softgray">
                        <th className="px-3 py-2 font-medium">City</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap pr-4 text-right tabular-nums">Visitors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCitiesRows.map((row) => (
                        <tr key={row[0]} className="border-b border-charcoal/10 align-top">
                          <td className="px-3 py-2 text-charcoal break-words" title={row[0]}>{row[0]}</td>
                          <td className="px-3 py-2 whitespace-nowrap pr-4 text-right tabular-nums text-charcoal">{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <UtmLinkBuilder />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <DataTable
              title="Reservations by Source"
              headers={["Source", "Reservations"]}
              rows={reservationsBySourceRows}
              empty="No reservation submissions in this range."
            />
            <DataTable
              title="Reservations by City"
              headers={["City", "Reservations"]}
              rows={reservationsByCityRows}
              empty="No reservation city data yet."
            />
            <DataTable
              title="Conversion by Device"
              headers={["Device", "Visitors", "Reservations", "Conversion Rate"]}
              rows={conversionByDeviceRows}
              empty="No device conversion data in this range."
            />
          </div>

          <section className="mt-6 border border-charcoal/10 bg-ivory p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-2xl text-charcoal">Recent Activity</h3>
              <div className="flex flex-wrap gap-2">
                {(["all", "page", "conversion", "click", "admin"] as GroupKey[]).map((option) => (
                  <Link
                    key={option}
                    href={`/admin/activity?range=${range}&group=${option}${includeAdminTraffic ? "&include_admin=1" : ""}`}
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
              <div className="mt-4 overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-charcoal/10 text-softgray">
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">Event</th>
                      <th className="px-3 py-2 font-medium">Path</th>
                      <th className="px-3 py-2 font-medium">Visitor</th>
                      <th className="px-3 py-2 font-medium">Device</th>
                      <th className="px-3 py-2 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeed.map((event) => (
                      <tr key={event.id} className="border-b border-charcoal/10 align-top">
                        <td className="px-3 py-2 text-softgray">{new Date(event.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2 text-charcoal">{formatEventLabel(event.event_type)}</td>
                        <td className="px-3 py-2 text-charcoal break-words" title={formatPathLabel(event.page_path)}>
                          {formatPathLabel(event.page_path)}
                        </td>
                        <td className="px-3 py-2 text-softgray">{event.visitor_id || "—"}</td>
                        <td className="px-3 py-2 text-softgray">{event.device || "—"}</td>
                        <td
                          className="px-3 py-2 text-softgray break-words"
                          title={
                            event.utm_source || event.utm_medium
                              ? `${event.utm_source || "(direct)"} / ${event.utm_medium || "(none)"}`
                              : getReferrerDomain(event.referrer) || "Direct"
                          }
                        >
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
