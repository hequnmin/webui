<script lang="ts">
  import { browser } from '$app/environment';
  import {
    loading,
    ensureConversation,
    syncConversation,
  } from '$lib/stores/chat';
  import type { Message } from '$lib/types/chat';

  let inputValue = $state<string>('');

  async function handleSend() {
    if ($loading) return; // 👈 防重复

    if (!inputValue.trim()) return;

    await sendQuery(inputValue);
    inputValue = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function removeReferenceTags(text: string): string {
    return text.replace(/<reference\b[^>]*>[\s\S]*?<\/reference>/gi, '');
  }

  // 核心方法
  async function sendQuery(inputValue: string): Promise<void> {
    if (!browser) return;
    if (!inputValue.trim()) return;

    let conv = ensureConversation(inputValue);

    // 用户消息
    const uMessage: Message = {
      role: 'user',
      content: inputValue,
      loading: false,
    };

    conv = {
      ...conv,
      messages: [...conv.messages, uMessage],
    };

    syncConversation(conv);

    loading.set(true);

    // AI 占位消息
    let aMessage: Message = {
      role: 'assistant',
      content: '正在思考...',
      loading: true,
    };

    conv = {
      ...conv,
      messages: [...conv.messages, aMessage],
    };

    syncConversation(conv);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue }),
      });

      const data: { answer?: string } = await res.json();
      const answer = data.answer ?? '(无返回内容)';

      const content = removeReferenceTags(answer);

      // 更新 AI 消息
      aMessage = {
        ...aMessage,
        content: content,
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
        content: '请求失败',
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
</script>

<!-- 输入区域 -->
<div class="input-area">
  <textarea
    bind:value={inputValue}
    placeholder="输入你的问题..."
    oninput={(e) => autoResize(e.currentTarget)}
    onkeydown={handleKeydown}
  ></textarea>
  <button onclick={handleSend} disabled={$loading}> 发送 </button>
</div>
