import type { SafeUser } from "$lib/utils/api";
import crypto from "crypto";

export interface Session {
  id: string;
  user: SafeUser;
  createdAt: number;
}

// 简单内存 session 存储。生产环境多实例部署时应换成 Redis。
const sessions = new Map<string, Session>();

// 30 天过期
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = "ate_session";

export function createSession(user: SafeUser): Session {
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    user,
    createdAt: Date.now(),
  };
  sessions.set(id, session);
  return session;
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_MAX_AGE_MS) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function serializeSessionCookie(
  sessionId: string,
  options: { maxAge?: number; path?: string; httpOnly?: boolean } = {},
): string {
  const {
    maxAge = SESSION_MAX_AGE_MS / 1000,
    path = "/",
    httpOnly = true,
  } = options;
  return `${SESSION_COOKIE}=${sessionId}; Max-Age=${maxAge}; Path=${path}; HttpOnly; SameSite=Lax`;
}

export function serializeClearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
}
