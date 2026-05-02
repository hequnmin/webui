import { writable, get } from "svelte/store";
import type { Conversation } from "$lib/types/chat";

const STORAGE_KEY = "chat_conversations";
const CURRENT_KEY = "chat_current_id";

// 会话列表和当前会话
export const conversations = writable<Conversation[]>(loadConversations());
export const conversation = writable<Conversation | null>(null);

// 读取本地存储函数
function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

// 写入本地存储函数
function saveConversations(list: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("保存本地会话失败", err);
  }
}

// 状态
export const loading = writable(false);

// 确保有当前会话
export function ensureConversation(title: string): Conversation {
  let conv = get(conversation);

  if (!conv) {
    conv = {
      id: crypto.randomUUID(),
      title,
      messages: [],
    };
    conversation.set(conv);
    syncConversation(conv);
  }

  return conv;
}

// 同步会话列表
export function syncConversation(conv: Conversation) {
  conversation.set(conv);

  conversations.update((list) => {
    const newList = list.some((c) => c.id === conv.id)
      ? list.map((c) => (c.id === conv.id ? conv : c))
      : [conv, ...list]; // 新会话放前面
    saveConversations(newList); // 🌟 持久化
    return newList;
  });
}

// 创建新会话
export function createConversation(title: string): Conversation {
  const conv: Conversation = {
    id: crypto.randomUUID(),
    title: title.slice(0, 20),
    messages: [],
  };
  syncConversation(conv); // 同时加入列表并持久化
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
export function deleteConversation(id: string) {
  conversations.update((list) => {
    const newList = list.filter((c) => c.id !== id);
    saveConversations(newList); // 🌟 持久化
    return newList;
  });

  conversation.update((current) => {
    if (current?.id === id) return null;
    return current;
  });
}

// conversation.subscribe((conv) => {
//   if (conv?.id) {
//     localStorage.setItem(CURRENT_KEY, conv.id);
//   }
// });
