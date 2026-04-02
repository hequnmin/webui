<script lang="ts">
  // 消息类型定义
  type Message = {
    role: 'user' | 'assistant';
    content: string;
  };

  let inputValue = $state<string>('');
  let loading = $state<boolean>(false);
  let messages = $state<Message[]>([]);

  let chatContainer: HTMLDivElement | null = null;

  async function sendQuery(): Promise<void> {
    if (!inputValue.trim()) return;

    const userText = inputValue;

    // 添加用户消息
    messages = [...messages, { role: 'user', content: userText }];

    inputValue = '';
    loading = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      });

      const data: { answer?: string } = await res.json();

      const answer = data.answer ?? '(无返回内容)';

      // 添加AI回复
      messages = [...messages, { role: 'assistant', content: answer }];
    } catch (err) {
      console.error(err);

      messages = [...messages, { role: 'assistant', content: '请求失败' }];
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      sendQuery();
    }
  }

  // 自动滚动
  $effect(() => {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
</script>

<div class="page">
  <!-- 聊天区域 -->
  <div class="chat" bind:this={chatContainer}>
    {#each messages as msg}
      <div class="message {msg.role}">
        <div class="bubble">
          {msg.content}
        </div>
      </div>
    {/each}

    {#if loading}
      <div class="message assistant">
        <div class="bubble loading">AI 正在思考...</div>
      </div>
    {/if}
  </div>

  <!-- 输入区域 -->
  <div class="input-area">
    <input
      bind:value={inputValue}
      placeholder="输入你的问题..."
      onkeydown={handleKeydown}
    />
    <button onclick={sendQuery} disabled={loading}> 发送 </button>
  </div>
</div>

<style>
  .page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f7f7f8;
  }

  .chat {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .message {
    display: flex;
    margin-bottom: 12px;
  }

  .user {
    justify-content: flex-end;
  }

  .assistant {
    justify-content: flex-start;
  }

  .bubble {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.5;
  }

  .user .bubble {
    background: #4f46e5;
    color: white;
  }

  .assistant .bubble {
    background: white;
    border: 1px solid #ddd;
  }

  .input-area {
    border-top: 1px solid #ddd;
    padding: 12px;
    background: white;
    display: flex;
    gap: 10px;
  }

  input {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 14px;
  }

  button {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: #4f46e5;
    color: white;
    cursor: pointer;
  }

  button:disabled {
    background: #aaa;
  }

  .loading {
    font-size: 12px;
    color: #888;
  }
</style>
