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

  // optional (if you added these columns)
  archived_at?: string | null;
  deleted_at?: string | null;
};

const STATUSES = ["new", "confirmed", "declined", "completed"] as const;
const VIEWS = ["all", ...STATUSES, "archived"] as const;

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function safeUpper(s: string) {
  return (s || "").toUpperCase();
}

export default function AdminReservationsTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [filter, setFilter] = useState<(typeof VIEWS)[number]>("all");
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => {
    // Never show soft-deleted rows anywhere
    const base = rows.filter((r) => !r.deleted_at);

    if (filter === "all") return base.filter((r) => !r.archived_at);
    if (filter === "archived") return base.filter((r) => !!r.archived_at);

    // status tabs show only non-archived
    return base.filter((r) => !r.archived_at && (r.status || "new") === filter);
  }, [rows, filter]);

  async function patchRow(id: string, patch: Record<string, any>) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
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

  async function setStatus(id: string, status: string) {
    const ok = await patchRow(id, { status });
    if (!ok) return;

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function archiveToggle(id: string, next: boolean) {
    const ok = await patchRow(id, { archive: next });
    if (!ok) return;

    // we can’t rely on server returning timestamp, so we set a client hint
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, archived_at: next ? new Date().toISOString() : null } : r
      )
    );
  }

  async function softDelete(id: string) {
    if (!confirm("Delete this reservation? (This is reversible only in DB)")) return;
    const ok = await patchRow(id, { softDelete: true });
    if (!ok) return;

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, deleted_at: new Date().toISOString() } : r))
    );
  }

  async function notifyGuest(id: string, kind: "confirmed" | "declined" | "reschedule") {
    const msg =
      prompt(
        kind === "confirmed"
          ? "Optional message to guest (Confirmed). Leave blank for default:"
          : kind === "declined"
            ? "Optional message to guest (Declined). Leave blank for default:"
            : "Type the reschedule message (suggest alternate time), or leave blank for default:"
      ) || "";

    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/notify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, message: msg }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "Email failed");

      alert("Email sent ✅");
    } catch (e) {
      console.error(e);
      alert("Could not send email.");
    } finally {
      setBusy(null);
    }
  }

  const showing = visible.length;
  const total = rows.filter((r) => !r.deleted_at).length;

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

        <div className="ml-auto text-xs text-softgray">
          Showing {showing} of {total}
        </div>
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
            {visible.map((r) => {
              const isArchived = !!r.archived_at;

              return (
                <tr key={r.id} className="border-b border-charcoal/10 align-top">
                  <td className="py-3 pr-3 whitespace-nowrap">{fmt(r.created_at)}</td>

                  <td className="py-3 pr-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-softgray">
                      <a className="underline" href={`mailto:${r.email}`}>
                        {r.email}
                      </a>
                      {r.phone ? (
                        <>
                          {" • "}
                          <a className="underline" href={`tel:${r.phone}`}>
                            {r.phone}
                          </a>
                        </>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-3 pr-3 whitespace-nowrap">
                    {r.date} {r.time} • party {r.party_size}
                  </td>

                  <td className="py-3 pr-3 min-w-[220px]">
                    <div className="text-softgray">{r.notes || "—"}</div>
                  </td>

                  <td className="py-3 pr-3 whitespace-nowrap">
                    <span className="rounded-full border border-charcoal/15 bg-ivory px-2 py-1 text-xs">
                      {safeUpper(r.status || "new")}
                      {isArchived ? " • ARCHIVED" : ""}
                    </span>
                  </td>

                  <td className="py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {/* Status buttons */}
                      {!isArchived && (
                        <>
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
                        </>
                      )}

                      {/* Archive / Unarchive */}
                      <button
                        disabled={busy === r.id}
                        onClick={() => archiveToggle(r.id, !isArchived)}
                        className="rounded-full border border-charcoal/20 px-3 py-1.5 text-xs text-charcoal hover:bg-charcoal/5 disabled:opacity-60"
                      >
                        {isArchived ? "unarchive" : "archive"}
                      </button>

                      {/* Email guest actions */}
                      <button
                        disabled={busy === r.id}
                        onClick={() => notifyGuest(r.id, "confirmed")}
                        className="rounded-full border border-charcoal/20 px-3 py-1.5 text-xs text-charcoal hover:bg-charcoal/5 disabled:opacity-60"
                      >
                        email: confirmed
                      </button>

                      <button
                        disabled={busy === r.id}
                        onClick={() => notifyGuest(r.id, "declined")}
                        className="rounded-full border border-charcoal/20 px-3 py-1.5 text-xs text-charcoal hover:bg-charcoal/5 disabled:opacity-60"
                      >
                        email: declined
                      </button>

                      <button
                        disabled={busy === r.id}
                        onClick={() => notifyGuest(r.id, "reschedule")}
                        className="rounded-full border border-charcoal/20 px-3 py-1.5 text-xs text-charcoal hover:bg-charcoal/5 disabled:opacity-60"
                      >
                        email: reschedule
                      </button>

                      {/* Soft delete only allowed in Archived view */}
                      {isArchived && (
                        <button
                          disabled={busy === r.id}
                          onClick={() => softDelete(r.id)}
                          className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-700 hover:bg-red-500/10 disabled:opacity-60"
                        >
                          delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {visible.length === 0 && (
              <tr>
                <td className="py-10 text-center text-softgray" colSpan={6}>
                  No reservations in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-softgray">
        Tip: archive keeps history without clutter. Delete is only available for archived items.
      </div>
    </div>
  );
}
