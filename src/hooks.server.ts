import type { Handle } from "@sveltejs/kit";
import { getSession, getSessionCookieName } from "$lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get(getSessionCookieName());
  if (sessionCookie) {
    const session = getSession(sessionCookie);
    if (session) {
      event.locals.user = session.user;
    }
  }

  return resolve(event);
};
