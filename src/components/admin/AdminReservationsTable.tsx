"use client";

import { useEffect, useMemo, useState } from "react";

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

function toDT(r: Row) {
  const d = (r.date || "").trim();
  const t = (r.time || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  if (!/^\d{2}:\d{2}$/.test(t)) return null;
  const iso = `${d}T${t}:00`;
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

function prettyDate(d: string) {
  const v = (d || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return d;
  // Use noon to avoid timezone date shifting
  const dt = new Date(`${v}T12:00:00`);
  return dt.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" });
}

function prettyTime(t: string) {
  const v = (t || "").trim();
  const m = v.match(/^(\d{2}):(\d{2})$/);
  if (!m) return t;
  let hh = Number(m[1]);
  const mm = m[2];
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${mm} ${ampm}`;
}

export default function AdminReservationsTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const [filter, setFilter] = useState<(typeof VIEWS)[number]>("active");
  const [timeView, setTimeView] = useState<(typeof TIME_VIEWS)[number]>("upcoming");
  const [q, setQ] = useState("");

  const [busy, setBusy] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [target, setTarget] = useState<Row | null>(null);

  // Email kind
  const [kind, setKind] = useState<"confirmed" | "declined" | "reschedule">("confirmed");
  const [message, setMessage] = useState("");

  // Reschedule helpers
  const [proposeDate, setProposeDate] = useState("");
  const [proposeTime, setProposeTime] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  async function patchRow(id: string, payload: any) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
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

  async function notifyGuest(id: string, k: "confirmed" | "declined" | "reschedule", msg: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/notify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: k, message: msg }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "Notify failed");
      return true;
    } catch (e: unknown) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Could not send email.");
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
      prev.map((x) => (x.id === r.id ? { ...x, archived_at: next ? new Date().toISOString() : null } : x))
    );

    // keep modal target in sync
    setTarget((t) => (t && t.id === r.id ? { ...t, archived_at: next ? new Date().toISOString() : null } : t));
  }

  async function softDelete(r: Row) {
    if (!confirm(`Delete this reservation from ${r.name}?`)) return;
    const ok = await patchRow(r.id, { softDelete: true });
    if (!ok) return;

    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, deleted_at: new Date().toISOString() } : x)));
    closeModal(true);
  }

  function defaultMessageFor(k: "confirmed" | "declined" | "reschedule", r: Row) {
    if (k === "confirmed") return `We look forward to seeing you at ${prettyTime(r.time)} on ${prettyDate(r.date)}.`;
    if (k === "declined") {
      return (
        `We couldn’t confirm ${prettyTime(r.time)} on ${prettyDate(r.date)}. ` +
        `Reply with another preferred time (or day) and we’ll do our best to accommodate you.`
      );
    }
    return `We can accommodate you, but we may need to adjust the time. Reply with what works best and we’ll confirm.`;
  }

  function openModal(r: Row) {
    setTarget(r);
    setKind("confirmed");
    setMessage(defaultMessageFor("confirmed", r));
    setProposeDate(r.date || "");
    setProposeTime(r.time || "");
    setModalOpen(true);
    setModalClosing(false);
  }

  function closeModal(immediate = false) {
    if (!modalOpen) return;
    if (immediate) {
      setModalOpen(false);
      setTarget(null);
      setModalClosing(false);
      return;
    }
    setModalClosing(true);
    window.setTimeout(() => {
      setModalOpen(false);
      setTarget(null);
      setModalClosing(false);
    }, 180);
  }

  async function sendModal() {
    if (!target) return;

    const msg = (message || "").trim();
    if (!msg) {
      alert("Please enter a message.");
      return;
    }

    // confirmed/declined also updates status
    if (kind === "confirmed" || kind === "declined") {
      const nextStatus = kind;
      const ok = await patchRow(target.id, { status: nextStatus });
      if (!ok) return;

      setRows((prev) => prev.map((x) => (x.id === target.id ? { ...x, status: nextStatus } : x)));
      setTarget((t) => (t ? { ...t, status: nextStatus } : t));
    }

    let finalMsg = msg;
    if (kind === "reschedule") {
      const pd = (proposeDate || "").trim();
      const pt = (proposeTime || "").trim();
      if (pd || pt) finalMsg += `\n\nProposed alternative: ${prettyDate(pd || target.date)} ${prettyTime(pt || target.time)}`;
    }

    const ok = await notifyGuest(target.id, kind, finalMsg);
    if (!ok) return;

    alert("Email sent ✅");
    closeModal();
  }

  const filtered = useMemo(() => {
    const base = rows.filter((r) => !r.deleted_at);

    let out = base;
    if (filter === "active") out = out.filter((r) => !r.archived_at);
    else if (filter === "archived") out = out.filter((r) => !!r.archived_at);
    else if (filter !== "all") out = out.filter((r) => (r.status || "new") === filter);

    const qq = q.trim().toLowerCase();
    if (qq) {
      out = out.filter((r) => {
        const blob = `${r.name} ${r.email} ${r.phone || ""} ${r.date} ${r.time} ${r.notes || ""}`.toLowerCase();
        return blob.includes(qq);
      });
    }

    const now = new Date();
    if (timeView !== "allDates") {
      out = out.filter((r) => {
        const d = toDT(r);
        if (!d) return false;
        return timeView === "upcoming" ? d.getTime() >= now.getTime() : d.getTime() < now.getTime();
      });
    }

    // Sort: upcoming earliest first, past newest first
    out = out.slice().sort((a, b) => {
      const da = toDT(a);
      const db = toDT(b);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      if (timeView === "past") return tb - ta;
      return ta - tb;
    });

    return out;
  }, [rows, filter, q, timeView]);

  const kindLabel = (k: "confirmed" | "declined" | "reschedule") =>
    k === "confirmed" ? "CONFIRM" : k === "declined" ? "DECLINE" : "RESCHEDULE";

  return (
    <div className="p-4 sm:p-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {VIEWS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={[
                "rounded-full px-3 py-1.5 text-xs border transition",
                filter === k ? "border-gold bg-gold/20 text-charcoal" : "border-charcoal/15 bg-ivory text-softgray hover:bg-ivory/70",
              ].join(" ")}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* TIME selector */}
          <select
            value={timeView}
            onChange={(e) => setTimeView(e.target.value as any)}
            className="h-9 rounded-full border border-charcoal/15 bg-cream px-3 text-xs font-medium text-charcoal outline-none"
          >
            <option value="upcoming">UPCOMING</option>
            <option value="past">PAST</option>
            <option value="allDates">ALL DATES</option>
          </select>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="h-9 w-44 rounded-full border border-charcoal/15 bg-cream px-3 text-xs text-charcoal outline-none placeholder:text-softgray"
          />

          <div className="text-xs text-softgray">
            Showing {filtered.length} of {rows.filter((r) => !r.deleted_at).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-softgray">
            <tr className="border-b border-charcoal/10">
              <th className="py-2 text-left font-medium">Created</th>
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
                  {r.archived_at ? <div className="mt-1 text-[11px] text-softgray">Archived</div> : null}
                </td>

                <td className="py-3 pr-3 whitespace-nowrap">
                  {prettyDate(r.date)} {prettyTime(r.time)} • party {r.party_size}
                </td>

                <td className="py-3 pr-3 min-w-[220px]">
                  <div className="text-softgray">{r.notes || "—"}</div>
                </td>

                {/* Status selector */}
                <td className="py-3 pr-3 whitespace-nowrap">
                  <select
                    value={(r.status || "new") as any}
                    disabled={busy === r.id}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className="h-9 rounded-full border border-charcoal/15 bg-cream px-3 text-xs text-charcoal outline-none disabled:opacity-60"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </td>

                <td className="py-3 whitespace-nowrap">
                  <button
                    disabled={busy === r.id}
                    onClick={() => openModal(r)}
                    className="rounded-full border border-gold px-4 py-2 text-xs font-medium text-charcoal hover:bg-gold/15 disabled:opacity-60"
                  >
                    Actions
                  </button>
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

      {/* Modal */}
      {modalOpen && target && (
        <div
          className={[
            "fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity",
            // light overlay + blur (not dark)
            "backdrop-blur-[12px] bg-gradient-to-b from-white/55 via-white/40 to-white/55",
            modalClosing ? "opacity-0" : "opacity-100",
          ].join(" ")}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className={[
              "w-full max-w-2xl border border-charcoal/10 bg-cream shadow-sm transition-transform",
              modalClosing ? "scale-[0.98]" : "scale-100",
            ].join(" ")}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] tracking-[0.18em] text-softgray">ACTIONS</div>
                  <div className="mt-2 font-serif text-2xl text-charcoal">
                    {target.name} • {prettyDate(target.date)} {prettyTime(target.time)}
                  </div>
                  <div className="mt-1 text-xs text-softgray">
                    Party {target.party_size} • {target.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => closeModal()}
                  aria-label="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 text-softgray hover:bg-ivory"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(["confirmed", "declined", "reschedule"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setKind(k);
                      setMessage(defaultMessageFor(k, target));
                    }}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs border transition",
                      kind === k ? "border-gold bg-gold/20 text-charcoal" : "border-charcoal/15 bg-ivory text-softgray hover:bg-ivory/70",
                    ].join(" ")}
                  >
                    {kindLabel(k)}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <div className="text-[11px] tracking-[0.18em] text-softgray">MESSAGE</div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="mt-1 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
                />
              </div>

              {kind === "reschedule" && (
                <div className="mt-4 border border-charcoal/10 bg-ivory p-3">
                  <div className="text-[11px] tracking-[0.18em] text-softgray">PROPOSE A TIME</div>

                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-[11px] tracking-[0.18em] text-softgray">DATE</div>
                      <input
                        type="date"
                        value={proposeDate}
                        onChange={(e) => setProposeDate(e.target.value)}
                        className="mt-1 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
                      />
                    </div>

                    <div>
                      <div className="text-[11px] tracking-[0.18em] text-softgray">TIME</div>
                      <input
                        type="time"
                        value={proposeTime}
                        onChange={(e) => setProposeTime(e.target.value)}
                        className="mt-1 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProposeDate(target.date || "");
                        setProposeTime(target.time || "");
                      }}
                      className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs text-softgray hover:bg-cream"
                    >
                      reset to requested
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const pd = (proposeDate || "").trim();
                        const pt = (proposeTime || "").trim();
                        if (!pd && !pt) return;
                        setMessage((m) => {
                          const base = (m || "").replace(/\n\nProposed alternative:[\s\S]*$/, "");
                          return base + `\n\nProposed alternative: ${prettyDate(pd || target.date)} ${prettyTime(pt || target.time)}`;
                        });
                      }}
                      className="rounded-full border border-gold px-3 py-1.5 text-xs text-charcoal hover:bg-gold/15"
                    >
                      append to message
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === target.id}
                  onClick={sendModal}
                  className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-charcoal hover:opacity-90 disabled:opacity-60"
                >
                  Send Email
                </button>

                <button
                  type="button"
                  disabled={busy === target.id}
                  onClick={() => toggleArchive(target)}
                  className="rounded-full border border-charcoal/15 px-4 py-2 text-sm text-softgray hover:bg-ivory disabled:opacity-60"
                >
                  {target.archived_at ? "Unarchive" : "Archive"}
                </button>

                {/* Delete ONLY if you're in archived view AND the record is archived */}
                {filter === "archived" && !!target.archived_at ? (
                  <button
                    type="button"
                    disabled={busy === target.id}
                    onClick={() => softDelete(target)}
                    className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                ) : null}
              </div>

              <div className="mt-3 text-xs text-softgray">
                Confirm/Decline also updates status automatically. Reschedule only emails. (ESC to close)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
