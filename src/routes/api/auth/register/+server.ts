import type { RequestHandler } from "./$types";
import { encryptPassword } from "$lib/server/crypto";
import { PUBLIC_API_URL } from "$env/static/public";

const API_BASE = PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { userno, username, email, password, remark } = body;

  if (!userno || !username || !email || !password) {
    return new Response(JSON.stringify({ error: "缺少必要字段" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. 检查用户编号或邮箱是否已存在
  const checkRes = await fetch(
    `${API_BASE}/user?or=(userno.eq.${encodeURIComponent(userno)},email.eq.${encodeURIComponent(email)})`,
  );
  if (!checkRes.ok) {
    return new Response(JSON.stringify({ error: "查询用户失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const existing = await checkRes.json();
  if (existing.length > 0) {
    return new Response(JSON.stringify({ error: "用户编号或邮箱已存在" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. 使用 ATE2020 相同算法加密密码
  const encryptedPassword = encryptPassword(password);

  // 3. 调用 PostgREST 创建用户
  const createRes = await fetch(`${API_BASE}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      userno,
      username,
      email,
      password: encryptedPassword,
      disable: false,
      remark: remark ?? null,
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    return new Response(JSON.stringify({ error: `创建用户失败: ${text}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await createRes.json();
  return new Response(JSON.stringify(data[0]), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
