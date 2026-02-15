"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApplicantRow, ApplicantStatus } from "@/lib/applicants";

export default function ApplicantsManager({ rows }: { rows: ApplicantRow[] }) {
  const router = useRouter();
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>(
    () => Object.fromEntries(rows.map((r) => [r.id, r.admin_note || ""]))
  );

  async function patchRow(id: string, payload: { status?: ApplicantStatus; admin_note?: string | null }) {
    const res = await fetch(`/api/admin/applicants/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
  }

  async function deleteRow(id: string) {
    const res = await fetch(`/api/admin/applicants/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Delete failed");
  }

  function setRowMessage(id: string, message: string) {
    setMessages((prev) => ({ ...prev, [id]: message }));
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[840px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-charcoal/10 text-softgray">
            <th className="py-2 pr-3 font-medium">Name</th>
            <th className="py-2 pr-3 font-medium">Email</th>
            <th className="py-2 pr-3 font-medium">Phone</th>
            <th className="py-2 pr-3 font-medium">Position</th>
            <th className="py-2 pr-3 font-medium">Created</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 pr-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isOpen = openIds.includes(row.id);
            const isBusy = busyId === row.id;
            return (
              <tr key={row.id} className="border-b border-charcoal/10 align-top">
                <td className="py-2 pr-3 text-charcoal">
                  <button
                    type="button"
                    onClick={() => setOpenIds((prev) => (prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]))}
                    className="underline decoration-gold/60 underline-offset-4"
                  >
                    {row.full_name}
                  </button>
                  {messages[row.id] ? <div className="mt-1 text-xs text-softgray">{messages[row.id]}</div> : null}
                </td>
                <td className="py-2 pr-3 text-charcoal">{row.email}</td>
                <td className="py-2 pr-3 text-softgray">{row.phone || "—"}</td>
                <td className="py-2 pr-3 text-charcoal">{row.position}</td>
                <td className="py-2 pr-3 text-softgray">{new Date(row.created_at).toLocaleString()}</td>
                <td className="py-2 pr-3 text-charcoal capitalize">{row.status}</td>
                <td className="py-2 pr-3 text-charcoal">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(row.id);
                        setRowMessage(row.id, "");
                        try {
                          await patchRow(row.id, { status: "reviewed" });
                          setRowMessage(row.id, "Marked reviewed.");
                          router.refresh();
                        } catch (err) {
                          setRowMessage(row.id, err instanceof Error ? err.message : "Failed.");
                        } finally {
                          setBusyId("");
                        }
                      }}
                      className="rounded-full border border-charcoal/20 px-3 py-1 text-xs disabled:opacity-70"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(row.id);
                        setRowMessage(row.id, "");
                        try {
                          await patchRow(row.id, { status: "archived" });
                          setRowMessage(row.id, "Archived.");
                          router.refresh();
                        } catch (err) {
                          setRowMessage(row.id, err instanceof Error ? err.message : "Failed.");
                        } finally {
                          setBusyId("");
                        }
                      }}
                      className="rounded-full border border-charcoal/20 px-3 py-1 text-xs disabled:opacity-70"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        if (!window.confirm("Delete this applicant?")) return;
                        setBusyId(row.id);
                        setRowMessage(row.id, "");
                        try {
                          await deleteRow(row.id);
                          setRowMessage(row.id, "Deleted.");
                          router.refresh();
                        } catch (err) {
                          setRowMessage(row.id, err instanceof Error ? err.message : "Failed.");
                        } finally {
                          setBusyId("");
                        }
                      }}
                      className="rounded-full border border-charcoal/20 px-3 py-1 text-xs disabled:opacity-70"
                    >
                      Delete
                    </button>
                  </div>

                  {isOpen ? (
                    <div className="mt-3 space-y-2 border border-charcoal/10 bg-ivory p-3">
                      <div className="text-xs text-softgray">
                        <span className="tracking-[0.16em]">AVAILABILITY</span>
                        <div className="mt-1 text-sm text-charcoal">{row.availability || "—"}</div>
                      </div>
                      <div className="text-xs text-softgray">
                        <span className="tracking-[0.16em]">WEBSITE</span>
                        <div className="mt-1 text-sm text-charcoal break-all">{row.website || "—"}</div>
                      </div>
                      <div className="text-xs text-softgray">
                        <span className="tracking-[0.16em]">MESSAGE</span>
                        <div className="mt-1 whitespace-pre-wrap text-sm text-charcoal">{row.message}</div>
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-[0.16em] text-softgray">INTERNAL NOTE</label>
                        <textarea
                          rows={3}
                          value={notes[row.id] ?? ""}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                          className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
                        />
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={async () => {
                            setBusyId(row.id);
                            setRowMessage(row.id, "");
                            try {
                              await patchRow(row.id, { admin_note: (notes[row.id] || "").trim() || null });
                              setRowMessage(row.id, "Saved.");
                              router.refresh();
                            } catch (err) {
                              setRowMessage(row.id, err instanceof Error ? err.message : "Failed.");
                            } finally {
                              setBusyId("");
                            }
                          }}
                          className="mt-2 rounded-full border border-gold px-3 py-1 text-xs text-charcoal disabled:opacity-70"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
