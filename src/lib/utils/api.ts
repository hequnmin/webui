export interface User {
  userid?: number;
  userno: string;
  username: string;
  email: string;
  password: string;
  disable: boolean;
  lastlogin?: string | null;
  remark?: string | null;
}

export interface SafeUser {
  userid: number;
  userno: string;
  username: string;
  email: string;
  disable: boolean;
  lastlogin?: string | null;
  remark?: string | null;
}

export async function registerUser(
  user: Omit<User, "userid">,
): Promise<SafeUser> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `注册失败: ${res.status}`);
  }
  return data;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<SafeUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `登录失败: ${res.status}`);
  }
  return data;
}
