// $lib/utils/chat.ts
import { browser } from "$app/environment";
import {
  loading,
  ensureConversation,
  syncConversation,
} from "$lib/stores/chat";
import type { Message } from "$lib/types/chat";

function removeReferenceTags(text: string): string {
  return text.replace(/<reference\b[^>]*>[\s\S]*?<\/reference>/gi, "");
}

export async function sendQuery(inputValue: string): Promise<void> {
  if (!browser) return;
  if (!inputValue.trim()) return;

  let conv = ensureConversation(inputValue);

  const uMessage: Message = {
    role: "user",
    content: inputValue,
    loading: false,
  };

  conv = {
    ...conv,
    messages: [...conv.messages, uMessage],
  };
  syncConversation(conv);
  loading.set(true);

  let aMessage: Message = {
    role: "assistant",
    content: "正在思考...",
    loading: true,
  };

  conv = {
    ...conv,
    messages: [...conv.messages, aMessage],
  };
  syncConversation(conv);

  try {
    const res = await window.fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: inputValue }),
    });

    const data: { answer?: string } = await res.json();
    const answer = data.answer ?? "(无返回内容)";
    const content = removeReferenceTags(answer);

    aMessage = {
      ...aMessage,
      content,
      loading: false,
    };

    conv = {
      ...conv,
      messages: [...conv.messages.slice(0, -1), aMessage],
    };
    syncConversation(conv);
  } catch (err) {
    console.error(err);
    aMessage = {
      ...aMessage,
      content: "请求失败",
      loading: false,
    };
    conv = {
      ...conv,
      messages: [...conv.messages.slice(0, -1), aMessage],
    };
    syncConversation(conv);
  } finally {
    loading.set(false);
  }
}
