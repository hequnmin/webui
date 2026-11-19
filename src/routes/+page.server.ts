import type { PageServerLoad } from "./$types";
import { PUBLIC_API_URL } from "$env/static/public";

const API_BASE = PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return { user: null, conversations: null };
  }

  const res = await fetch(
    `${API_BASE}/conversations?userid=eq.${locals.user.userid}&order=updated_at.desc`,
  );
  if (!res.ok) {
    return { user: locals.user, conversations: [] };
  }

  const rows = await res.json();
  const conversations = rows.map((row: Record<string, unknown>) => ({
    id: row.conv_id as string,
    title: row.title as string,
    messages: row.messages as import("$lib/types/chat").Message[],
  }));

  return {
    user: locals.user,
    conversations,
  };
};
