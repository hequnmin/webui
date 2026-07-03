import type { RequestHandler } from "./$types";
import { PUBLIC_API_URL } from "$env/static/public";

const API_BASE = PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { userid, updates } = body;

  if (!userid || !updates || typeof updates !== "object") {
    return new Response(JSON.stringify({ error: "参数错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 不允许通过这里修改密码和 disable 状态
  const safeUpdates = { ...updates };
  delete safeUpdates.password;
  delete safeUpdates.disable;
  delete safeUpdates.userid;

  const res = await fetch(
    `${API_BASE}/user?userid=eq.${encodeURIComponent(String(userid))}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(safeUpdates),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return new Response(JSON.stringify({ error: `更新失败: ${text}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  const { password: _, ...safeUser } = data[0];
  return new Response(JSON.stringify(safeUser), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
