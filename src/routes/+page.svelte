<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ChatWindow from '$lib/components/ChatWindow.svelte';

  import { initConversations, conversations, conversation } from '$lib/stores/chat';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';

  onMount(() => {
    initConversations();
    const list = get(conversations);

    if (list.length > 0) {
      // 默认选中第一个（你也可以改成“最后使用的”）
      conversation.set(list[0]);
    }
  })
</script>

<div class="page">
  <Sidebar />
  <ChatWindow />
</div>
