import type { RequestHandler } from "./$types";
import {
  deleteSession,
  getSessionCookieName,
  serializeClearSessionCookie,
} from "$lib/server/session";

export const POST: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get(getSessionCookieName());
  if (sessionId) {
    deleteSession(sessionId);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": serializeClearSessionCookie(),
    },
  });
};
