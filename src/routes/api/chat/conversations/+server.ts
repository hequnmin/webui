import type { RequestHandler } from "./$types";
import type { Conversation, Message } from "$lib/types/chat";
import { PUBLIC_API_URL } from "$env/static/public";

const API_BASE = PUBLIC_API_URL ?? "http://127.0.0.1:3001";

function toDbRecord(userid: number, conv: Conversation) {
  return {
    userid,
    conv_id: conv.id,
    title: conv.title,
    messages: conv.messages,
  };
}

// GET /api/chat/conversations - 获取当前用户的所有会话
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(
    `${API_BASE}/conversations?userid=eq.${locals.user.userid}&order=updated_at.desc`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return new Response(JSON.stringify({ error: `获取会话失败: ${text}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await res.json();
  const conversations: Conversation[] = rows.map((row: Record<string, unknown>) => ({
    id: row.conv_id as string,
    title: row.title as string,
    messages: row.messages as Message[],
  }));

  return new Response(JSON.stringify(conversations), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// POST /api/chat/conversations - 创建或更新会话
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const conv = body as Conversation;

  // 先查询是否已存在
  const checkRes = await fetch(
    `${API_BASE}/conversations?userid=eq.${locals.user.userid}&conv_id=eq.${encodeURIComponent(conv.id)}`,
  );
  if (!checkRes.ok) {
    const text = await checkRes.text().catch(() => "");
    console.error("[conversations] 查询会话失败:", text);
    return new Response(JSON.stringify({ error: `查询会话失败: ${text}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const existing = await checkRes.json();
  const record = toDbRecord(locals.user.userid, conv);

  if (existing.length > 0) {
    // 更新
    const updateRes = await fetch(
      `${API_BASE}/conversations?userid=eq.${locals.user.userid}&conv_id=eq.${encodeURIComponent(conv.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      },
    );
    if (!updateRes.ok) {
      const text = await updateRes.text().catch(() => "");
      console.error("[conversations] 更新会话失败:", text);
      return new Response(JSON.stringify({ error: `更新会话失败: ${text}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    // 新建
    const createRes = await fetch(`${API_BASE}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!createRes.ok) {
      const text = await createRes.text().catch(() => "");
      console.error("[conversations] 创建会话失败:", text);
      return new Response(JSON.stringify({ error: `创建会话失败: ${text}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// DELETE /api/chat/conversations?conv_id=xxx - 删除会话
export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const convId = url.searchParams.get("conv_id");
  if (!convId) {
    return new Response(JSON.stringify({ error: "缺少会话 ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(
    `${API_BASE}/conversations?userid=eq.${locals.user.userid}&conv_id=eq.${encodeURIComponent(convId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return new Response(JSON.stringify({ error: `删除会话失败: ${text}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
