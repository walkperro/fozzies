"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  date: string;
  time: string;
  notes: string | null;
  status: string;
  source: string | null;
  archived_at?: string | null;
  deleted_at?: string | null;
};

const STATUSES = ["new", "confirmed", "declined", "completed"] as const;
const VIEWS = ["active", "archived", "all", ...STATUSES] as const;

const TIME_VIEWS = ["upcoming", "past", "allDates"] as const;
function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function AdminReservationsTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [filter, setFilter] = useState<(typeof VIEWS)[number]>("active");
  const [timeView, setTimeView] = useState<(typeof TIME_VIEWS)[number]>("upcoming");
const [busy, setBusy] = useState<string | null>(null);

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyRow, setNotifyRow] = useState<Row | null>(null);
  const [notifyKind, setNotifyKind] = useState<"confirmed" | "declined" | "reschedule">("confirmed");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifySending, setNotifySending] = useState(false);

  function openNotify(r: Row) {
    setNotifyRow(r);
    setNotifyKind("confirmed");
    setNotifyMsg(
`Hi ${r.name},

Your reservation request looks great — we’re confirming ${r.date} at ${r.time} for ${r.party_size}.

If anything changes, just reply here and we’ll take care of it.

— Fozzie’s`
    );
    setNotifyOpen(true);
  }

  function templateFor(kind: "confirmed" | "declined" | "reschedule", r: Row) {
    if (kind === "confirmed") {
      return `Hi ${r.name},

Your reservation is confirmed for ${r.date} at ${r.time} for ${r.party_size}.

We look forward to seeing you.

— Fozzie’s`;
    }
    if (kind === "declined") {
      return `Hi ${r.name},

We couldn’t confirm ${r.date} at ${r.time} for ${r.party_size}.

Reply with a couple alternate times that work for you and we’ll do our best to accommodate.

— Fozzie’s`;
    }
    return `Hi ${r.name},

Can we shift your reservation to a nearby time?

Reply with what works best and we’ll confirm right away.

— Fozzie’s`;
  }

  async function sendNotify() {
    if (!notifyRow) return;
    setNotifySending(true);
    try {
      const res = await fetch(`/api/admin/reservations/${notifyRow.id}/notify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: notifyKind, message: notifyMsg }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Notify failed");
      setNotifyOpen(false);
      setNotifyRow(null);
      alert("Notification sent.");
    } catch (e) {
      console.error(e);
      alert("Could not send notification email.");
    } finally {
      setNotifySending(false);
    }
  }
const filtered = useMemo(() => {
    const base = rows.filter((r) => !r.deleted_at); // never show soft-deleted in UI

    // Start from view filter
    let out = base;
    if (filter !== "all") {
      if (filter === "active") out = out.filter((r) => !r.archived_at);
      else if (filter === "archived") out = out.filter((r) => !!r.archived_at);
      else out = out.filter((r) => (r.status || "new") === filter);
    }

    // Time-based filter (date+time)
    const now = new Date();

    function toDT(r: Row) {
      // Interpret as local time
      const iso = `${r.date}T${r.time}:00`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d;
    }

    if (timeView !== "allDates") {
      out = out.filter((r) => {
        const d = toDT(r);
        if (!d) return false;
        return timeView === "upcoming" ? d.getTime() >= now.getTime() : d.getTime() < now.getTime();
      });
    }

    // Sort: upcoming soonest first; past most recent first; allDates = upcoming first then past
    out = out.slice().sort((a, b) => {
      const da = toDT(a);
      const db = toDT(b);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;

      if (timeView === "past") return tb - ta;
      if (timeView === "upcoming") return ta - tb;

      // allDates: simple chronological ascending
      return ta - tb;
    });

    return out;
  }, [rows, filter, timeView]);async function patchRow(id: string, payload: any) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Update failed");
      return true;
    } catch (e) {
      console.error(e);
      alert("Could not update reservation.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(id: string, status: string) {
    const ok = await patchRow(id, { status });
    if (!ok) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function toggleArchive(r: Row) {
    const next = !r.archived_at;
    const ok = await patchRow(r.id, { archive: next });
    if (!ok) return;
    setRows((prev) =>
      prev.map((x) =>
        x.id === r.id ? { ...x, archived_at: next ? new Date().toISOString() : null } : x
      )
    );
  }

  async function softDelete(r: Row) {
    if (!confirm(`Soft-delete this reservation from ${r.name}? (You can restore later if we add it)`)) return;
    const ok = await patchRow(r.id, { softDelete: true });
    if (!ok) return;
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, deleted_at: new Date().toISOString() } : x)));
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {VIEWS.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={[
              "rounded-full px-3 py-1.5 text-xs border transition",
              filter === k
                ? "border-gold bg-gold/20 text-charcoal"
                : "border-charcoal/15 bg-ivory text-softgray hover:bg-ivory/70",
            ].join(" ")}
          >
            {k.toUpperCase()}
          </button>
        ))}
        <div className="w-full h-px bg-charcoal/10 my-3" />

        <div className="flex flex-wrap items-center gap-2 w-full">
          {TIME_VIEWS.map((k) => (
            <button
              key={k}
              onClick={() => setTimeView(k)}
              className={[
                "rounded-full px-3 py-1.5 text-xs border transition",
                timeView === k
                  ? "border-gold bg-gold/20 text-charcoal"
                  : "border-charcoal/15 bg-ivory text-softgray hover:bg-ivory/70",
              ].join(" ")}
            >
              {k === "allDates" ? "ALL DATES" : k.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs text-softgray">Showing {filtered.length} of {rows.filter(r=>!r.deleted_at).length}</div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-softgray">
            <tr className="border-b border-charcoal/10">
              <th className="py-2 text-left font-medium">When</th>
              <th className="py-2 text-left font-medium">Guest</th>
              <th className="py-2 text-left font-medium">Reservation</th>
              <th className="py-2 text-left font-medium">Notes</th>
              <th className="py-2 text-left font-medium">Status</th>
              <th className="py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-charcoal">
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-charcoal/10 align-top">
                <td className="py-3 pr-3 whitespace-nowrap">{fmt(r.created_at)}</td>
                <td className="py-3 pr-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-softgray">
                    <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>
                    {r.phone ? (
                      <>
                        {" • "}
                        <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a>
                      </>
                    ) : null}
                  </div>
                  {r.archived_at ? (
                    <div className="mt-1 text-[11px] text-softgray">Archived</div>
                  ) : null}
                </td>
                <td className="py-3 pr-3 whitespace-nowrap">
                  {r.date} {r.time} • party {r.party_size}
                </td>
                <td className="py-3 pr-3 min-w-[220px]">
                  <div className="text-softgray">{r.notes || "—"}</div>
                </td>
                <td className="py-3 pr-3 whitespace-nowrap">
                  <span className="rounded-full border border-charcoal/15 bg-ivory px-2 py-1 text-xs">
                    {(r.status || "new").toUpperCase()}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busy === r.id}
                      onClick={() => openNotify(r)}
                      className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal hover:bg-ivory disabled:opacity-60"
                    >
                      notify
                    </button>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={busy === r.id}
                        onClick={() => setStatus(r.id, s)}
                        className="rounded-full border border-gold px-3 py-1.5 text-xs text-charcoal hover:bg-gold/15 disabled:opacity-60"
                      >
                        {s}
                      </button>
                    ))}

                    <button
                      disabled={busy === r.id}
                      onClick={() => toggleArchive(r)}
                      className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs text-softgray hover:bg-ivory disabled:opacity-60"
                    >
                      {r.archived_at ? "unarchive" : "archive"}
                    </button>

                    <button
                      disabled={busy === r.id}
                      onClick={() => softDelete(r)}
                      className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="py-10 text-center text-softgray" colSpan={6}>
                  No reservations in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {notifyOpen && notifyRow && (
        <div className="fixed inset-0 z-[200]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !notifySending && (setNotifyOpen(false), setNotifyRow(null))}
          />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 border border-charcoal/15 bg-cream shadow-xl">
            <div className="p-5 sm:p-6">
              <div className="text-[11px] tracking-[0.18em] text-softgray">NOTIFY GUEST</div>
              <div className="mt-2 font-serif text-2xl text-charcoal">
                {notifyRow.name} • {notifyRow.date} {notifyRow.time} • party {notifyRow.party_size}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(["confirmed","declined","reschedule"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={notifySending}
                    onClick={() => {
                      setNotifyKind(k);
                      setNotifyMsg(templateFor(k, notifyRow));
                    }}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs border transition",
                      notifyKind === k
                        ? "border-gold bg-gold/20 text-charcoal"
                        : "border-charcoal/15 bg-ivory text-softgray hover:bg-ivory/70",
                    ].join(" ")}
                  >
                    {k.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <textarea
                  value={notifyMsg}
                  onChange={(e) => setNotifyMsg(e.target.value)}
                  rows={10}
                  className="w-full border border-charcoal/15 bg-ivory/60 p-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={notifySending}
                  onClick={() => (setNotifyOpen(false), setNotifyRow(null))}
                  className="rounded-full border border-charcoal/15 px-4 py-2 text-sm text-softgray hover:bg-ivory disabled:opacity-60"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={notifySending || !notifyMsg.trim().length}
                  onClick={sendNotify}
                  className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-charcoal hover:opacity-90 disabled:opacity-60"
                >
                  {notifySending ? "Sending…" : "Send Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

</div>
    );
}
