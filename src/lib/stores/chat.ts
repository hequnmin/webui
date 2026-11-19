import { writable, get } from "svelte/store";
import type { Conversation } from "$lib/types/chat";
import { v4 as uuidv4 } from "uuid";
import { browser } from "$app/environment";

const STORAGE_KEY = "chat_conversations";

// 会话列表和当前会话
export const conversations = writable<Conversation[]>([]);
export const conversation = writable<Conversation | null>(null);

// 是否已登录（由调用方设置）
export const isLoggedIn = writable<boolean>(false);

function loadLocalConversations(): Conversation[] {
  if (!browser) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalConversations(list: Conversation[]) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("保存本地会话失败", err);
  }
}

// 从服务端加载当前用户的会话
export async function loadConversationsFromServer(): Promise<Conversation[]> {
  const res = await fetch("/api/chat/conversations");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `加载会话失败: ${res.status}`);
  }
  const list: Conversation[] = await res.json();
  conversations.set(list);
  return list;
}

// 清空会话（退出登录时调用）
export function clearConversations() {
  conversations.set([]);
  conversation.set(null);
}

// 初始化：优先从服务端加载；未登录时从 localStorage 加载
export async function initConversations(): Promise<void> {
  if (!browser) return;

  if (get(isLoggedIn)) {
    try {
      await loadConversationsFromServer();
      return;
    } catch (err) {
      console.warn("从服务端加载会话失败，回退到本地", err);
    }
  }

  conversations.set(loadLocalConversations());
}

// 状态
export const loading = writable(false);

// 将会话同步到服务端或本地
async function persistConversation(conv: Conversation) {
  if (get(isLoggedIn)) {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conv),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("同步会话到服务端失败:", res.status, text);
      } else {
        console.log("会话已同步到服务端");
      }
    } catch (err) {
      console.error("同步会话到服务端失败", err);
    }
  } else {
    console.log("未登录，会话仅保存到本地");
  }

  // 同时更新本地缓存
  conversations.update((list) => {
    const exists = list.some((c) => c.id === conv.id);
    const newList = exists
      ? list.map((c) => (c.id === conv.id ? conv : c))
      : [conv, ...list];
    saveLocalConversations(newList);
    return newList;
  });
}

// 确保有当前会话
export function ensureConversation(title: string): Conversation {
  let conv = get(conversation);

  if (!conv) {
    conv = {
      id: uuidv4(),
      title,
      messages: [],
    };
    conversation.set(conv);
    persistConversation(conv);
  }

  return conv;
}

// 同步会话列表
export function syncConversation(conv: Conversation) {
  conversation.set(conv);
  persistConversation(conv);
}

// 创建新会话
export function createConversation(title: string): Conversation {
  const conv: Conversation = {
    id: uuidv4(),
    title: title.slice(0, 20),
    messages: [],
  };
  conversation.set(conv);
  persistConversation(conv);
  return conv;
}

// 切换会话
export function switchConversation(id: string): Conversation | null {
  const list = get(conversations);
  const conv = list.find((c) => c.id === id) ?? null;
  conversation.set(conv);
  return conv;
}

// 删除会话
export async function deleteConversation(id: string) {
  if (get(isLoggedIn)) {
    try {
      await fetch(`/api/chat/conversations?conv_id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("删除服务端会话失败", err);
    }
  }

  conversations.update((list) => {
    const newList = list.filter((c) => c.id !== id);
    saveLocalConversations(newList);
    return newList;
  });

  conversation.update((current) => {
    if (current?.id === id) return null;
    return current;
  });
}
