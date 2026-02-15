"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ActionState = "idle" | "saving" | "saved" | "error";

export default function ClientRowActions({
  id,
  initialName,
  initialUnsubscribed,
}: {
  id: string;
  initialName: string | null;
  initialUnsubscribed: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [editing, setEditing] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(initialUnsubscribed);
  const [state, setState] = useState<ActionState>("idle");
  const [message, setMessage] = useState("");

  async function patchClient(payload: { name?: string | null; unsubscribed?: boolean }) {
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.error || "Update failed");
    }
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

  async function toggleUnsubscribed() {
    const nextValue = !unsubscribed;
    if (nextValue && !window.confirm("Are you sure you want to unsubscribe this client?")) {
      return;
    }

    setState("saving");
    setMessage("");
    try {
      await patchClient({ unsubscribed: nextValue });
      setUnsubscribed(nextValue);
      setState("saved");
      setMessage(nextValue ? "Unsubscribed." : "Resubscribed.");
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to update subscription.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-charcoal">{name.trim() ? name : <span className="text-softgray">(none)</span>}</div>

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
          <button
            type="button"
            onClick={toggleUnsubscribed}
            disabled={state === "saving"}
            className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-70"
          >
            {unsubscribed ? "Resubscribe" : "Unsubscribe"}
          </button>
        </div>
      )}

      {message ? <div className={`text-xs ${state === "error" ? "text-red-700" : "text-softgray"}`}>{message}</div> : null}
    </div>
  );
}
