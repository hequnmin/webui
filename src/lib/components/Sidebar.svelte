<script lang="ts">
  import {
    conversations,
    conversation,
    createConversation,
    switchConversation,
  } from '$lib/stores/chat';

  function createNewChat() {
    conversation.set(null);

    console.log('new chat');
  }
</script>

<div class="sidebar">
  <button onclick={createNewChat}>+ 新会话</button>

  {#each $conversations as c}
    <div
      class="item"
      class:active={$conversation?.id === c.id}
      role="button"
      tabindex="0"
      onclick={() => switchConversation(c.id)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          switchConversation(c.id);
        }
      }}
    >
      {c.title}
    </div>
  {/each}
</div>
