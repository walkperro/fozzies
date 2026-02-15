import { revalidatePath } from "next/cache";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncementsForAdmin,
  updateAnnouncement,
} from "@/lib/announcements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toNullableDateTime(input: FormDataEntryValue | null) {
  const value = (typeof input === "string" ? input : "").trim();
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default async function AdminAnnouncementsPage() {
  async function createAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!title || !body) return;

    await createAnnouncement({
      title,
      body,
      pinned: formData.get("pinned") === "on",
      is_published: formData.get("is_published") === "on",
      starts_at: toNullableDateTime(formData.get("starts_at")),
      ends_at: toNullableDateTime(formData.get("ends_at")),
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
  }

  async function updateAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!id || !title || !body) return;

    await updateAnnouncement(id, {
      title,
      body,
      pinned: formData.get("pinned") === "on",
      is_published: formData.get("is_published") === "on",
      starts_at: toNullableDateTime(formData.get("starts_at")),
      ends_at: toNullableDateTime(formData.get("ends_at")),
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
  }

  async function deleteAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await deleteAnnouncement(id);
    revalidatePath("/admin/announcements");
    revalidatePath("/");
  }

  const { data, error } = await listAnnouncementsForAdmin();
  const rows = data ?? [];

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Announcements</h2>
        <p className="mt-2 text-sm text-softgray">Create and manage homepage announcements.</p>
      </div>

      <section className="mt-8 border border-charcoal/10 bg-ivory p-5">
        <h3 className="font-serif text-2xl text-charcoal">Create Announcement</h3>
        <form action={createAction} className="mt-4 grid gap-4">
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">TITLE</label>
            <input
              name="title"
              required
              className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">BODY</label>
            <textarea
              name="body"
              required
              rows={4}
              className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] tracking-[0.18em] text-softgray">STARTS AT</label>
              <input
                name="starts_at"
                type="datetime-local"
                className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.18em] text-softgray">ENDS AT</label>
              <input
                name="ends_at"
                type="datetime-local"
                className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-charcoal">
            <label className="inline-flex items-center gap-2">
              <input name="pinned" type="checkbox" className="accent-gold" />
              Pinned
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="is_published" type="checkbox" defaultChecked className="accent-gold" />
              Published
            </label>
          </div>
          <div>
            <button className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90">
              Save Announcement
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 border border-charcoal/10 bg-cream p-5">
        <h3 className="font-serif text-2xl text-charcoal">Existing Announcements</h3>
        {error ? <p className="mt-3 text-sm text-red-700">Failed to load: {error.message}</p> : null}
        {!error && rows.length === 0 ? <p className="mt-3 text-sm text-softgray">No announcements yet.</p> : null}
        <div className="mt-4 space-y-4">
          {rows.map((row) => (
            <form key={row.id} action={updateAction} className="border border-charcoal/10 bg-ivory p-4">
              <input type="hidden" name="id" value={row.id} />
              <div className="grid gap-4">
                <div>
                  <label className="block text-[11px] tracking-[0.18em] text-softgray">TITLE</label>
                  <input
                    name="title"
                    required
                    defaultValue={row.title}
                    className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.18em] text-softgray">BODY</label>
                  <textarea
                    name="body"
                    required
                    rows={3}
                    defaultValue={row.body}
                    className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] tracking-[0.18em] text-softgray">STARTS AT</label>
                    <input
                      name="starts_at"
                      type="datetime-local"
                      defaultValue={toDateTimeLocal(row.starts_at)}
                      className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.18em] text-softgray">ENDS AT</label>
                    <input
                      name="ends_at"
                      type="datetime-local"
                      defaultValue={toDateTimeLocal(row.ends_at)}
                      className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-5 text-sm text-charcoal">
                  <label className="inline-flex items-center gap-2">
                    <input name="pinned" type="checkbox" defaultChecked={row.pinned} className="accent-gold" />
                    Pinned
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      name="is_published"
                      type="checkbox"
                      defaultChecked={row.is_published}
                      className="accent-gold"
                    />
                    Published
                  </label>
                </div>
                <div className="flex gap-3">
                  <button className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-charcoal transition hover:opacity-90">
                    Save Changes
                  </button>
                  <button
                    formAction={deleteAction}
                    className="rounded-full border border-charcoal/20 px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-charcoal/5"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-softgray">
                  Created {new Date(row.created_at).toLocaleString()} | Updated {new Date(row.updated_at).toLocaleString()}
                </div>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
