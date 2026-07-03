import type { RequestHandler } from "./$types";
import { encryptPassword } from "$lib/server/crypto";
import { PUBLIC_API_URL } from "$env/static/public";

const API_BASE = PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { userid, oldPassword, newPassword } = body;

  if (!userid || !oldPassword || !newPassword) {
    return new Response(JSON.stringify({ error: "参数错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. 查询当前用户密码
  const userRes = await fetch(
    `${API_BASE}/user?userid=eq.${encodeURIComponent(String(userid))}&disable=eq.false`,
  );
  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: "查询用户失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const users = await userRes.json();
  if (users.length === 0) {
    return new Response(JSON.stringify({ error: "用户不存在" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = users[0];
  const encryptedOld = encryptPassword(oldPassword);
  if (encryptedOld !== user.password) {
    return new Response(JSON.stringify({ error: "当前密码错误" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. 更新为新密码
  const encryptedNew = encryptPassword(newPassword);
  const updateRes = await fetch(
    `${API_BASE}/user?userid=eq.${encodeURIComponent(String(userid))}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: encryptedNew }),
    },
  );

  if (!updateRes.ok) {
    const text = await updateRes.text().catch(() => "");
    return new Response(JSON.stringify({ error: `修改密码失败: ${text}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
