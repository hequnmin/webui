import type { RequestHandler } from "./$types";
import { encryptPassword } from "$lib/server/crypto";
import { PUBLIC_API_URL } from "$env/static/public";

const API_BASE = PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "请输入邮箱和密码" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. 根据邮箱查询用户
  const userRes = await fetch(
    `${API_BASE}/user?email=eq.${encodeURIComponent(email)}&disable=eq.false`,
  );
  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: "登录验证失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const users = await userRes.json();
  if (users.length === 0) {
    return new Response(JSON.stringify({ error: "邮箱或密码错误" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = users[0];

  // 2. 使用 ATE2020 相同算法加密输入密码，与数据库中的密文比较
  const encryptedInput = encryptPassword(password);
  if (encryptedInput !== user.password) {
    return new Response(JSON.stringify({ error: "邮箱或密码错误" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. 返回用户信息（去掉密码字段）
  const { password: _, ...safeUser } = user;
  return new Response(JSON.stringify(safeUser), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
