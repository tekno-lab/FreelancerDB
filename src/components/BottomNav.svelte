<script>
  import { activeTab, alertCount } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { triggerHaptic } from '../lib/utils.js';

  function setTab(tab) {
    triggerHaptic();
    $activeTab = tab;
  }
</script>

<nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 pb-safe transition-colors shadow-lg">
  <div class="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
    <!-- Renewals -->
    <button
      type="button"
      on:click={() => setTab('renewals')}
      class="flex flex-col items-center justify-center h-full touch-press transition-all {$activeTab === 'renewals' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'}"
    >
      <div class="relative px-3 py-1 rounded-2xl transition-all {$activeTab === 'renewals' ? 'bg-sky-500/10 dark:bg-sky-400/15' : ''}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span class="text-[10px] mt-0.5 tracking-tight">{t('nav_renewals', $lang)}</span>
    </button>

    <!-- Quotes -->
    <button
      type="button"
      on:click={() => setTab('quotes')}
      class="flex flex-col items-center justify-center h-full touch-press transition-all {$activeTab === 'quotes' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'}"
    >
      <div class="relative px-3 py-1 rounded-2xl transition-all {$activeTab === 'quotes' ? 'bg-sky-500/10 dark:bg-sky-400/15' : ''}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <span class="text-[10px] mt-0.5 tracking-tight">{t('nav_quotes', $lang)}</span>
    </button>

    <!-- Services -->
    <button
      type="button"
      on:click={() => setTab('services')}
      class="flex flex-col items-center justify-center h-full touch-press transition-all {$activeTab === 'services' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'}"
    >
      <div class="relative px-3 py-1 rounded-2xl transition-all {$activeTab === 'services' ? 'bg-sky-500/10 dark:bg-sky-400/15' : ''}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <span class="text-[10px] mt-0.5 tracking-tight">{t('nav_services', $lang)}</span>
    </button>

    <!-- Alerts -->
    <button
      type="button"
      on:click={() => setTab('alerts')}
      class="flex flex-col items-center justify-center h-full touch-press transition-all relative {$activeTab === 'alerts' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'}"
    >
      <div class="relative px-3 py-1 rounded-2xl transition-all {$activeTab === 'alerts' ? 'bg-sky-500/10 dark:bg-sky-400/15' : ''}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {#if $alertCount > 0}
          <span class="absolute top-0.5 right-1.5 rtl:right-auto rtl:left-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
        {/if}
      </div>
      <span class="text-[10px] mt-0.5 tracking-tight">{t('nav_alerts', $lang)}</span>
    </button>

    <!-- Settings -->
    <button
      type="button"
      on:click={() => setTab('settings')}
      class="flex flex-col items-center justify-center h-full touch-press transition-all {$activeTab === 'settings' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'}"
    >
      <div class="relative px-3 py-1 rounded-2xl transition-all {$activeTab === 'settings' ? 'bg-sky-500/10 dark:bg-sky-400/15' : ''}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <span class="text-[10px] mt-0.5 tracking-tight">{t('nav_settings', $lang)}</span>
    </button>
  </div>
</nav>
