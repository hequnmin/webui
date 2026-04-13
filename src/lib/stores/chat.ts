import { writable, get } from "svelte/store";
import type { Conversation } from "$lib/types/chat";

export const conversations = writable<Conversation[]>([]);
export const conversation = writable<Conversation | null>(); // 当前会话

// 状态
export const loading = writable(false);

export function ensureConversation(title: string): Conversation {
  let conv = get(conversation);

  if (!conv) {
    conv = {
      id: crypto.randomUUID(),
      title,
      messages: [],
    };

    conversation.set(conv);
  }

  return conv;
}

export function syncConversation(conv: Conversation) {
  conversation.set(conv);

  conversations.update((list) =>
    list.some((c) => c.id === conv.id)
      ? list.map((c) => (c.id === conv.id ? conv : c))
      : [...list, conv],
  );
}

export function createConversation(title: string): Conversation {
  return {
    id: crypto.randomUUID(),
    title: title.slice(0, 20),
    messages: [],
  };
}

export function switchConversation(id: string): Conversation | null {
  const list = get(conversations);

  const conv = list.find((c) => c.id === id) ?? null;

  conversation.set(conv);

  return conv;
}
