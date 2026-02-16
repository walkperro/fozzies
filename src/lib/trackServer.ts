import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ServerTrackPayload = {
  event_type: string;
  page_path?: string | null;
  visitor_id?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  device?: string | null;
  meta?: Record<string, unknown>;
};

function clip(value: string | null | undefined, max: number) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function logServerEvent(payload: ServerTrackPayload) {
  try {
    const supabase = supabaseAdmin();
    await supabase.schema("fozzies").from("analytics_events").insert({
      event_type: clip(payload.event_type, 80),
      page_path: clip(payload.page_path, 500),
      visitor_id: clip(payload.visitor_id, 120),
      user_agent: clip(payload.user_agent, 400),
      referrer: clip(payload.referrer, 1000),
      device: clip(payload.device, 20),
      meta: payload.meta ?? {},
    });
  } catch {
    // Silent fail: analytics should never block primary request flow.
  }
}
