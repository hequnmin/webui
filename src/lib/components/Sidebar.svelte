<script lang="ts">
  import {
    conversations,
    conversation,
    createConversation,
    switchConversation,
    deleteConversation,
  } from '$lib/stores/chat';

  let openMenuId = $state<string | null>(null);

  let editingId = $state<string | null>(null);
  let editingTitle = $state('');

  let inputRef = $state<HTMLInputElement | null>(null);

  $effect(() => {
    editingId;
    if (editingId && inputRef) {
      setTimeout(() => {
        inputRef?.focus();
        inputRef?.select();
      }, 0);
    }
  });

  function toggleMenu(id: string) {
    openMenuId = openMenuId === id ? null : id;
  }
  function closeMenu() {
    openMenuId = null;
  }

  function createNewChat() {
    conversation.set(null);

    console.log('new chat');
  }

  function handleRename(id: string, title: string) {
    editingId = id;
    editingTitle = title;
    closeMenu();
  }

  function saveRename(id: string) {
    const newTitle = editingTitle.trim();
    if (!newTitle) return;

    conversations.update((list) =>
      list.map((c) =>
        c.id === id ? { ...c, title: newTitle } : c
      )
    );

    editingId = null;
  }

  function startRename(id: string, title: string) {
    editingId = id;
    editingTitle = title;
    closeMenu();
  }

  function handleDelete(id: string) {
    deleteConversation(id);
    closeMenu();
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
      onmouseleave={closeMenu}
    >
      
      {#if editingId === c.id}
        <input
          bind:this={inputRef}
          class="rename-input"
          bind:value={editingTitle}
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => {
            if (e.key === 'Enter') saveRename(c.id);
            if (e.key === 'Escape') editingId = null;
          }}
          onblur={() => saveRename(c.id)}
        />
      {:else}
        <span
          class="title"
          role="button"
          tabindex="0"
          ondblclick={(e) => {
            e.stopPropagation();
            startRename(c.id, c.title);
          }}
        >
          {c.title}
        </span>
      {/if}
      <button
        class="more-button"
        onclick={(e) => {
          e.stopPropagation();
          toggleMenu(c.id);
        }}
      >
       ⋯
      </button>

      {#if openMenuId === c.id}
        <div 
          class="menu"
          role="button"
          tabindex="0"
          onclick={(e) => e.stopPropagation()}
          onkeydown={() => {}}
        >
          <div 
            class="menu-item"
            role="button"
            tabindex="0"
            onclick={() => handleRename(c.id, c.title)}
            onkeydown={() => {}}
          >
            重命名
          </div>
          <div 
            class="menu-item danger" 
            role="button"
            tabindex="0"
            onclick={() => handleDelete(c.id)} 
            onkeydown={() => {}}
          >
            删除
          </div>
        </div>
      {/if}

    </div>
  {/each}
</div>
