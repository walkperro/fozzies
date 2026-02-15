"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ActionState = "idle" | "saving" | "saved" | "error";

export default function ClientRowActions({
  id,
  initialName,
  initialUnsubscribed,
  initialSuppressed,
  initialSuppressedReason,
}: {
  id: string;
  initialName: string | null;
  initialUnsubscribed: boolean;
  initialSuppressed: boolean;
  initialSuppressedReason: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [editing, setEditing] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(initialUnsubscribed);
  const [suppressed, setSuppressed] = useState(initialSuppressed);
  const [suppressedReason, setSuppressedReason] = useState<string | null>(initialSuppressedReason);
  const [suppressReasonInput, setSuppressReasonInput] = useState<"manual" | "hard_bounce" | "complaint">("manual");
  const [state, setState] = useState<ActionState>("idle");
  const [message, setMessage] = useState("");

  async function post(path: string, payload?: object) {
    const res = await fetch(path, {
      method: "POST",
      headers: payload ? { "content-type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
  }

  async function patchClient(payload: { name?: string | null; unsubscribed?: boolean }) {
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
  }

  async function saveName() {
    setState("saving");
    setMessage("");
    try {
      await patchClient({ name: name.trim() ? name.trim() : null });
      setState("saved");
      setMessage("Saved.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to update name.");
    }
  }

  async function unsubscribe() {
    if (!window.confirm("Are you sure you want to unsubscribe this client?")) return;
    setState("saving");
    setMessage("");
    try {
      await patchClient({ unsubscribed: true });
      setUnsubscribed(true);
      setSuppressed(true);
      setSuppressedReason("unsubscribed");
      setState("saved");
      setMessage("Unsubscribed.");
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to unsubscribe.");
    }
  }

  async function resubscribe() {
    if (!window.confirm("Resubscribe this client?")) return;
    setState("saving");
    setMessage("");
    try {
      await post(`/api/admin/clients/${id}/resubscribe`);
      setUnsubscribed(false);
      setSuppressed(false);
      setSuppressedReason(null);
      setState("saved");
      setMessage("Resubscribed.");
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to resubscribe.");
    }
  }

  async function suppress() {
    setState("saving");
    setMessage("");
    try {
      await post(`/api/admin/clients/${id}/suppress`, { reason: suppressReasonInput });
      setSuppressed(true);
      setSuppressedReason(suppressReasonInput);
      setState("saved");
      setMessage("Suppressed.");
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to suppress.");
    }
  }

  async function unsuppress() {
    setState("saving");
    setMessage("");
    try {
      await post(`/api/admin/clients/${id}/unsuppress`);
      setSuppressed(false);
      setSuppressedReason(null);
      setState("saved");
      setMessage("Unsuppressed.");
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to unsuppress.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-charcoal">{name.trim() ? name : <span className="text-softgray">—</span>}</div>

      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-[180px] border border-charcoal/15 bg-ivory px-2 py-1 text-sm text-charcoal outline-none"
            placeholder="Client name"
          />
          <button
            type="button"
            onClick={saveName}
            disabled={state === "saving"}
            className="rounded-full border border-gold px-3 py-1 text-xs text-charcoal disabled:opacity-70"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(initialName ?? "");
              setMessage("");
              setState("idle");
            }}
            className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal"
          >
            Edit name
          </button>

          {unsubscribed ? (
            <button
              type="button"
              onClick={resubscribe}
              disabled={state === "saving"}
              className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-70"
            >
              Resubscribe
            </button>
          ) : (
            <button
              type="button"
              onClick={unsubscribe}
              disabled={state === "saving"}
              className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-70"
            >
              Unsubscribe
            </button>
          )}

          {suppressed ? (
            <button
              type="button"
              onClick={unsuppress}
              disabled={state === "saving"}
              className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-70"
            >
              Unsuppress
            </button>
          ) : (
            <>
              <select
                value={suppressReasonInput}
                onChange={(e) => setSuppressReasonInput(e.target.value as "manual" | "hard_bounce" | "complaint")}
                className="rounded-full border border-charcoal/20 bg-ivory px-3 py-1 text-xs text-charcoal outline-none"
                aria-label="Suppression reason"
              >
                <option value="manual">Manual</option>
                <option value="hard_bounce">Bounce</option>
                <option value="complaint">Complaint</option>
              </select>
              <button
                type="button"
                onClick={suppress}
                disabled={state === "saving"}
                className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-70"
              >
                Suppress
              </button>
            </>
          )}
        </div>
      )}

      {message ? <div className={`text-xs ${state === "error" ? "text-red-700" : "text-softgray"}`}>{message}</div> : null}
    </div>
  );
}
