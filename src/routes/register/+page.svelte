<script lang="ts">
  import { goto } from '$app/navigation';
  import { Kanban } from '@lucide/svelte';
  import { registerUser } from '$lib/utils/api';

  let userno = $state('');
  let username = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let errors = $state<Record<string, string>>({});
  let generalError = $state('');
  let success = $state('');
  let submitting = $state(false);

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!userno.trim()) {
      next.userno = '请输入用户编号';
    }

    if (!username.trim()) {
      next.username = '请输入用户名';
    } else if (username.length < 2) {
      next.username = '用户名至少需要 2 个字符';
    }

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

    if (password !== confirmPassword) {
      next.confirmPassword = '两次输入的密码不一致';
    }

    errors = next;
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    generalError = '';
    if (!validate()) return;

    submitting = true;
    try {
      await registerUser({
        userno: userno.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        disable: false,
        remark: null,
      });

      success = '注册成功！正在跳转到登录页面…';
      setTimeout(() => {
        goto('/login');
      }, 5000);
    } catch (err) {
      generalError = err instanceof Error ? err.message : '注册失败，请稍后重试';
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

    <h1 class="text-2xl font-semibold text-gray-900 mb-2">创建账号</h1>
    <p class="text-sm text-gray-500 mb-6">填写以下信息完成注册</p>

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
        <label for="userno" class="block text-sm font-medium text-gray-700 mb-1">用户编号</label>
        <input
          id="userno"
          type="text"
          autocomplete="off"
          bind:value={userno}
          class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
          placeholder="如 U001"
        />
        {#if errors.userno}
          <p class="mt-1 text-xs text-red-500">{errors.userno}</p>
        {/if}
      </div>

      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
        <input
          id="username"
          type="text"
          autocomplete="username"
          bind:value={username}
          class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
          placeholder="你的用户名"
        />
        {#if errors.username}
          <p class="mt-1 text-xs text-red-500">{errors.username}</p>
        {/if}
      </div>

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
          autocomplete="new-password"
          bind:value={password}
          class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
          placeholder="••••••••"
        />
        {#if errors.password}
          <p class="mt-1 text-xs text-red-500">{errors.password}</p>
        {/if}
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
        <input
          id="confirmPassword"
          type="password"
          autocomplete="new-password"
          bind:value={confirmPassword}
          class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
          placeholder="••••••••"
        />
        {#if errors.confirmPassword}
          <p class="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={submitting}
        class="w-full py-2.5 px-4 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium transition-colors"
      >
        {submitting ? '注册中…' : '注册'}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      已有账号？
      <a href="/login" class="text-green-600 hover:text-green-700 font-medium">立即登录</a>
    </p>
  </div>
</div>
