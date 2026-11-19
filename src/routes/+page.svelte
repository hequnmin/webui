<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ChatWindow from '$lib/components/ChatWindow.svelte';

  import { conversations, conversation, isLoggedIn } from '$lib/stores/chat';
  import { onMount } from 'svelte';

  let { data } = $props();

  // 根据服务端返回的会话数据初始化 store
  $effect(() => {
    isLoggedIn.set(!!data.user);
    if (data.conversations) {
      conversations.set(data.conversations);
      if (data.conversations.length > 0) {
        conversation.set(data.conversations[0]);
      }
    }
  });

  // 未登录时回退到 localStorage
  onMount(() => {
    if (!data.user) {
      try {
        const raw = localStorage.getItem('chat_conversations');
        const list = raw ? JSON.parse(raw) : [];
        conversations.set(list);
        if (list.length > 0) {
          conversation.set(list[0]);
        }
      } catch {
        conversations.set([]);
      }
    }
  });
</script>

<div class="page">
  <Sidebar />
  <ChatWindow />
</div>
