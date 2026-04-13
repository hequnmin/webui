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
