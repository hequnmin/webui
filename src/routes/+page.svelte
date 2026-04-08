<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';

  type Message = {
    role: 'user' | 'assistant';
    content: string;
  };

  type Conversation = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
  };

  let conversations = $state<Conversation[]>([]);
  let currentId = $state<string | null>(null);
  let inputValue = $state('');
  let loading = $state(false);

  // 当前会话
  let currentConversation = $derived(
    conversations.find((c) => c.id === currentId)
  );

  // 创建新会话
  function createConversation() {
    const id = crypto.randomUUID();

    const newConv: Conversation = {
      id,
      title: '新对话',
      messages: [],
      createdAt: Date.now()
    };

    conversations = [newConv, ...conversations];
    currentId = id;
  }

  // 切换会话
  function selectConversation(id: string) {
    currentId = id;
  }

  // 删除会话（加一个基础功能）
  function deleteConversation(id: string) {
    conversations = conversations.filter((c) => c.id !== id);

    if (currentId === id) {
      currentId = conversations[0]?.id ?? null;
    }
  }

  // 发送消息
  async function sendQuery() {
    if (!inputValue.trim() || !currentConversation) return;

    loading = true;

    const userMessage: Message = {
      role: 'user',
      content: inputValue
    };

    currentConversation.messages = [
      ...currentConversation.messages,
      userMessage
    ];

    const query = inputValue;
    inputValue = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data?.answer ?? '(无返回)'
      };

      currentConversation.messages = [
        ...currentConversation.messages,
        aiMessage
      ];

      // 自动生成标题（仅第一次）
      if (currentConversation.messages.length === 2) {
        currentConversation.title = query.slice(0, 20);
      }
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  // 本地存储
  onMount(() => {
    const saved = localStorage.getItem('conversations');
    if (saved) {
      conversations = JSON.parse(saved);
      currentId = conversations[0]?.id ?? null;
    } else {
      createConversation();
    }
  });

  $effect(() => {
    conversations; // 👈 依赖追踪
    localStorage.setItem(
      'conversations',
      JSON.stringify(conversations)
    );
  });
</script>

<div class="app">
  <!-- 左侧 -->
  <div class="sidebar">
    <button class="new-btn"
      tabindex="0"
      onclick={() => createConversation }
    >
      + 新对话
    </button>

    {#each conversations as conv}
      <div class="item"
        role="button"
        tabindex="0"
        onclick={() => selectConversation(conv.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            selectConversation(conv.id);
          }
        }}
      >
        <span>{conv.title}</span>
        <button 
          onclick={(e) => {
            e.stopPropagation();
            deleteConversation(conv.id);
          }}
        >×</button>
      </div>
    {/each}
  </div>
    <!-- 右侧 -->
  <div class="chat">
    {#if currentConversation}
      <div class="messages">
        {#each currentConversation.messages as msg}
          <div class="msg {msg.role}">
            {msg.content}
          </div>
        {/each}
      </div>
    {/if}

    <div class="input-area">
      <input
        bind:value={inputValue}
        placeholder="请输入..."
        onkeydown={(e) => e.key === 'Enter' && sendQuery()}
      />
      <button class="button-primary" onclick={sendQuery}>发送</button>
    </div>

    {#if loading}
      <div class="loading">AI思考中...</div>
    {/if}
  </div>
</div>

