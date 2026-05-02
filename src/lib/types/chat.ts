// 消息类型定义
export type Message = {
  role: "user" | "assistant";
  content: string;
  loading: boolean;
};

// 会话类型定义
export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

export const StorageKey = "chat_conversations";
export const CurrentKey = "chat_current_id";
