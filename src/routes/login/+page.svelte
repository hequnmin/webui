<script lang="ts">
  import { goto } from '$app/navigation';
  import { Kanban } from '@lucide/svelte';
  import { loginUser } from '$lib/utils/api';

  let email = $state('');
  let password = $state('');
  let errors = $state<Record<string, string>>({});
  let generalError = $state('');
  let success = $state('');
  let submitting = $state(false);

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!email.trim()) {
      next.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = '邮箱格式不正确';
    }

    if (!password) {
      next.password = '请输入密码';
    } else if (password.length < 6) {
      next.password = '密码至少需要 6 位';
    }

    errors = next;
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    generalError = '';
    success = '';
    if (!validate()) return;

    submitting = true;
    try {
      await loginUser(email.trim(), password);
      success = '登录成功！正在进入系统…';
      setTimeout(() => {
        goto('/');
      }, 1000);
    } catch (err) {
      generalError = err instanceof Error ? err.message : '登录失败，请稍后重试';
      submitting = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-[#f7f7f8] p-4">
  <div class="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="flex items-center justify-center gap-2 mb-8">
      <Kanban class="w-7 h-7 stroke-2 text-green-500" />
      <span class="text-xl font-semibold text-gray-900">Blueway ATE</span>
    </div>

    <h1 class="text-2xl font-semibold text-gray-900 mb-2">欢迎回来</h1>
    <p class="text-sm text-gray-500 mb-6">请输入你的账号信息以继续使用</p>

    {#if generalError}
      <div class="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
        {generalError}
      </div>
    {/if}

    {#if success}
      <div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
        {success}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-5">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
        <input
          id="email"
          type="email"
          autocomplete="email"
          bind:value={email}
          class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
          placeholder="name@example.com"
        />
        {#if errors.email}
          <p class="mt-1 text-xs text-red-500">{errors.email}</p>
        {/if}
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
        <input
          id="password"
          type="password"
          autocomplete="current-password"
          bind:value={password}
          class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
          placeholder="••••••••"
        />
        {#if errors.password}
          <p class="mt-1 text-xs text-red-500">{errors.password}</p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={submitting}
        class="w-full py-2.5 px-4 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium transition-colors"
      >
        {submitting ? '登录中…' : '登录'}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      还没有账号？
      <a href="/register" class="text-green-600 hover:text-green-700 font-medium">立即注册</a>
    </p>
  </div>
</div>
