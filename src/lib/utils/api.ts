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

export async function updateUser(
  userid: number,
  updates: Partial<Omit<SafeUser, "userid">>,
): Promise<SafeUser> {
  const res = await fetch("/api/auth/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid, updates }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `更新失败: ${res.status}`);
  }
  return data;
}

export async function changePassword(
  userid: number,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid, oldPassword, newPassword }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `修改密码失败: ${res.status}`);
  }
}

export async function logoutUser(): Promise<void> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "退出登录失败");
  }
}
