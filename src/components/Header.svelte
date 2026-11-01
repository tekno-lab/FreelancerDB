<script>
  import { config, isOnline, isLoading, alertCount, activeTab } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { syncState } from '../lib/api.js';
  import { triggerHaptic } from '../lib/utils.js';

  export let onOpenNewModal = () => {};

  function handleSync() {
    triggerHaptic();
    syncState();
  }

  function handleBell() {
    triggerHaptic();
    $activeTab = 'alerts';
  }
</script>

<header class="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/90 pt-safe px-4 pb-3 transition-colors shadow-xs">
  <div class="flex items-center justify-between">
    <!-- Brand Info -->
    <div class="flex items-center space-x-2.5 rtl:space-x-reverse">
      <div class="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20">
        <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
          <span class="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-tr from-sky-400 to-cyan-200">TL</span>
        </div>
        {#if $alertCount > 0}
          <span class="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">
              {$alertCount}
            </span>
          </span>
        {/if}
      </div>

      <div>
        <div class="flex items-center space-x-1.5 rtl:space-x-reverse">
          <span class="text-base font-black tracking-tight text-slate-900 dark:text-white">Tekno Labs</span>
          <span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">{t('header_suite', $lang)}</span>
        </div>
        <div class="flex items-center space-x-1.5 rtl:space-x-reverse text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span class="inline-block w-2 h-2 rounded-full {$isOnline ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-amber-400'}"></span>
          <span>{$isOnline ? ($config.webAppUrl ? t('header_live', $lang) : t('header_local', $lang)) : t('header_offline', $lang)}</span>
        </div>
      </div>
    </div>

    <!-- Actions (Min 40px touch area) -->
    <div class="flex items-center space-x-1.5 rtl:space-x-reverse">
      <!-- Sync Button -->
      <button
        type="button"
        on:click={handleSync}
        disabled={$isLoading}
        title={t('header_sync', $lang)}
        class="touch-press min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 border border-slate-200 dark:border-slate-700/60 disabled:opacity-50 flex items-center justify-center transition-all"
        aria-label={t('header_sync', $lang)}
      >
        <svg class="w-4 h-4 {$isLoading ? 'animate-spin text-sky-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <!-- Alerts Button -->
      <button
        type="button"
        on:click={handleBell}
        title={t('nav_alerts', $lang)}
        class="touch-press min-h-[40px] min-w-[40px] relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-all"
        aria-label={t('nav_alerts', $lang)}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {#if $alertCount > 0}
          <span class="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
            {$alertCount}
          </span>
        {/if}
      </button>

      <!-- Quick Add Button -->
      <button
        type="button"
        on:click={onOpenNewModal}
        class="touch-press min-h-[40px] flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>{t('header_add', $lang)}</span>
      </button>
    </div>
  </div>
</header>
