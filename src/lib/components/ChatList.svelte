<script lang="ts">
  import { marked } from 'marked';
  import { conversation } from '$lib/stores/chat';
  let chatContainer: HTMLDivElement | null = null;

  // 自动滚动
  $effect(() => {
    $conversation?.messages; // 👈 依赖声明（关键），只有 messages 变化才滚动

    if (!chatContainer) return;

    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
</script>

<!-- 聊天区域 -->
<div class="chat" bind:this={chatContainer}>
  {#each $conversation?.messages ?? [] as msg}
    <div class="message {msg.role}">
      <div class="bubble {msg.loading ? 'loading' : ''}">
        {#if msg.loading}
          AI 正在思考...
        {:else}
          {@html marked.parse(msg.content)}
        {/if}
      </div>
    </div>
  {/each}
</div>
