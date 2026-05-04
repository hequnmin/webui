<script lang="ts">
  import { Kanban, SquareKanban, SquarePen, Ellipsis, TextCursorInput, Trash2, PanelLeft } from 'lucide-svelte';
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
      list.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
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

<div class="w-64 bg-gray-100 flex flex-col p-2.5 h-full">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2 px-2.5 py-2 rounded-md">
      <Kanban class="w-5 h-5 stroke-2 text-green-500" />
      <span class="text-black text-base font-medium">Blueway ATE</span>
    </div>
    <PanelLeft class="w-4 h-4 cursor-pointer" />
  </div>
  <button
    class=" flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-gray-200"
    onclick={createNewChat}
  >
    <SquarePen class="w-4 h-4"/>
    <span class="text-black text-sm">新会话</span>
  </button>

  {#each $conversations as c}
    <div
      class="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-sm text-black transition-colors relative group {$conversation?.id === c.id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-200'}"
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
          class="w-full text-sm px-1.5 py-1 border border-indigo-600 rounded outline-none"
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
          class="truncate text-sm leading-relaxed flex-1"
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
        class="bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 text-gray-500 text-sm p-0.5 px-1 rounded hover:text-gray-700 transition-opacity"
        onclick={(e) => {
          e.stopPropagation();
          toggleMenu(c.id);
        }}
      >
        <Ellipsis class="w-4 h-4" />
      </button>

      {#if openMenuId === c.id}
        <div
          class="absolute right-2 top-9 bg-white border border-gray-200 rounded-md shadow-lg z-10"
          role="button"
          tabindex="0"
          onclick={(e) => e.stopPropagation()}
          onkeydown={() => {}}
        >
          <div
            class=" flex items-center gap-2 px-3 py-2 cursor-pointer whitespace-nowrap text-sm hover:bg-gray-100 rounded-t-md"
            role="button"
            tabindex="0"
            onclick={() => handleRename(c.id, c.title)}
            onkeydown={() => {}}
          >
            <TextCursorInput class="w-4 h-4" />
            <span class=" text-black text-sm">重命名</span>
          </div>
          <div
            class="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-b-md hover:bg-gray-100"
            role="button"
            tabindex="0"
            onclick={() => handleDelete(c.id)}
            onkeydown={() => {}}
          >
            <Trash2 class="w-4 h-4" />
            <span class="text-red-500 text-sm">删除</span>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>