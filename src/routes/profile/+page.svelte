<script lang="ts">
  import { page } from '$app/stores';
  import { Kanban } from '@lucide/svelte';
  import { updateUser, changePassword } from '$lib/utils/api';

  const user = $derived($page.data.user);

  let username = $state($page.data.user?.username ?? '');
  let userno = $state($page.data.user?.userno ?? '');
  let email = $state($page.data.user?.email ?? '');
  let remark = $state($page.data.user?.remark ?? '');

  let oldPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');

  let profileError = $state('');
  let profileSuccess = $state('');
  let passwordError = $state('');
  let passwordSuccess = $state('');
  let updating = $state(false);
  let changing = $state(false);

  async function handleUpdateProfile(e: SubmitEvent) {
    e.preventDefault();
    profileError = '';
    profileSuccess = '';
    if (!user) return;

    updating = true;
    try {
      const updated = await updateUser(user.userid, {
        username: username.trim(),
        userno: userno.trim(),
        email: email.trim(),
        remark: remark.trim() || null,
      });
      // 更新成功后刷新页面以重新加载服务端 session 数据
      profileSuccess = '个人信息更新成功，正在刷新…';
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      profileError = err instanceof Error ? err.message : '更新失败';
    } finally {
      updating = false;
    }
  }

  async function handleChangePassword(e: SubmitEvent) {
    e.preventDefault();
    passwordError = '';
    passwordSuccess = '';
    if (!user) return;

    if (newPassword.length < 6) {
      passwordError = '新密码至少需要 6 位';
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordError = '两次输入的新密码不一致';
      return;
    }

    changing = true;
    try {
      await changePassword(user.userid, oldPassword, newPassword);
      passwordSuccess = '密码修改成功';
      oldPassword = '';
      newPassword = '';
      confirmPassword = '';
    } catch (err) {
      passwordError = err instanceof Error ? err.message : '修改密码失败';
    } finally {
      changing = false;
    }
  }
</script>

<div class="min-h-screen bg-[#f7f7f8] p-4 md:p-8">
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-2 mb-8">
      <Kanban class="w-7 h-7 stroke-2 text-green-500" />
      <span class="text-xl font-semibold text-gray-900">Blueway ATE</span>
    </div>

    <h1 class="text-2xl font-semibold text-gray-900 mb-6">个人中心</h1>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">基本信息</h2>

      {#if profileError}
        <div class="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{profileError}</div>
      {/if}
      {#if profileSuccess}
        <div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{profileSuccess}</div>
      {/if}

      <form onsubmit={handleUpdateProfile} class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label for="userno" class="block text-sm font-medium text-gray-700 mb-1">用户编号</label>
            <input
              id="userno"
              type="text"
              bind:value={userno}
              class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              id="username"
              type="text"
              bind:value={username}
              class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <div>
          <label for="remark" class="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <input
            id="remark"
            type="text"
            bind:value={remark}
            class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          class="px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium transition-colors"
        >
          {updating ? '保存中…' : '保存基本信息'}
        </button>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">修改密码</h2>

      {#if passwordError}
        <div class="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{passwordError}</div>
      {/if}
      {#if passwordSuccess}
        <div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{passwordSuccess}</div>
      {/if}

      <form onsubmit={handleChangePassword} class="space-y-5">
        <div>
          <label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
          <input
            id="oldPassword"
            type="password"
            bind:value={oldPassword}
            class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input
            id="newPassword"
            type="password"
            bind:value={newPassword}
            class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
          <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={changing}
          class="px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium transition-colors"
        >
          {changing ? '修改中…' : '修改密码'}
        </button>
      </form>
    </div>
  </div>
</div>
