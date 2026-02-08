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
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = rows.filter((r) => !r.deleted_at); // never show soft-deleted in UI
    if (filter === "all") return base;
    if (filter === "active") return base.filter((r) => !r.archived_at);
    if (filter === "archived") return base.filter((r) => !!r.archived_at);
    // status filter
    return base.filter((r) => (r.status || "new") === filter);
  }, [rows, filter]);

  async function patchRow(id: string, payload: any) {
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
    </div>
  );
}
