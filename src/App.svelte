<script>
  import { onMount } from 'svelte';
  import { renewals, activeTab, toast, isLoading, config, theme } from './lib/stores.js';
  import { lang, t } from './lib/i18n.js';
  import { apiDeleteRenewal, apiSaveRenewal, syncState } from './lib/api.js';
  import { daysUntil, formatMoney, triggerHaptic } from './lib/utils.js';

  import Header from './components/Header.svelte';
  import BottomNav from './components/BottomNav.svelte';
  import RenewalCard from './components/RenewalCard.svelte';
  import RenewalModal from './components/RenewalModal.svelte';
  import QuoteBuilder from './components/QuoteBuilder.svelte';
  import ServicesManager from './components/ServicesManager.svelte';
  import NotificationCenter from './components/NotificationCenter.svelte';
  import SettingsModal from './components/SettingsModal.svelte';

  // Renewals View State
  let searchQuery = '';
  let selectedFilter = 'All'; // 'All' | 'Website' | 'QR Code' | 'Database' | 'Due Soon'
  let isModalOpen = false;
  let editingRenewal = null;

  onMount(() => {
    // If Web App URL is configured, perform silent initial sync
    if ($config.webAppUrl) {
      syncState();
    }
  });

  // Filtered Renewals
  $: filteredRenewals = ($renewals || []).filter(r => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      r.client?.toLowerCase().includes(q) ||
      r.item?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q);

    if (!matchSearch) return false;

    // Category / Status Filter
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Due Soon') {
      const d = daysUntil(r.expiryDate);
      return d <= 14 && r.status !== 'Renewed' && r.status !== 'Inactive';
    }
    return r.type === selectedFilter;
  });

  // Summary Metrics
  $: totalActive = ($renewals || []).filter(r => r.status !== 'Expired' && r.status !== 'Inactive').length;
  $: totalRevenue = ($renewals || []).filter(r => r.status !== 'Inactive').reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  $: totalDueSoon = ($renewals || []).filter(r => daysUntil(r.expiryDate) <= 14 && r.status !== 'Renewed' && r.status !== 'Inactive').length;

  function openNewModal() {
    triggerHaptic();
    editingRenewal = null;
    isModalOpen = true;
  }

  function handleEdit(r) {
    editingRenewal = r;
    isModalOpen = true;
  }

  async function handleDelete(r) {
    const confirmMsg = `${t('confirm_delete', $lang)} ${r.client} (${r.item})?`;
    if (confirm(confirmMsg)) {
      await apiDeleteRenewal(r.id);
    }
  }

  async function handleRenew(r) {
    const curDate = new Date(r.expiryDate || Date.now());
    curDate.setFullYear(curDate.getFullYear() + 1);
    const updated = {
      ...r,
      expiryDate: curDate.toISOString().slice(0, 10),
      status: 'Renewed'
    };
    await apiSaveRenewal(updated, true);
  }
</script>

<div class="h-full flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
  <!-- Top App Bar -->
  <Header onOpenNewModal={openNewModal} />

  <!-- Main Scrollable Content Area -->
  <main class="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
    {#if $activeTab === 'renewals'}
      <div class="space-y-4 pb-24 relative">
        <!-- Overview Stat Cards (Elevated) -->
        <div class="grid grid-cols-3 gap-2.5">
          <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider">{t('stat_tracked', $lang)}</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-lg font-black text-slate-900 dark:text-white leading-none">{totalActive}</span>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider">{t('stat_revenue', $lang)}</span>
              <svg class="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400 leading-none truncate">{formatMoney(totalRevenue, $config.currency)}</span>
          </div>

          <div class="bg-white dark:bg-slate-900 border rounded-2xl p-3 shadow-sm flex flex-col justify-between transition-colors {totalDueSoon > 0 ? 'border-amber-500/50 bg-amber-500/10 dark:bg-amber-950/20' : 'border-slate-200/90 dark:border-slate-800/90'}">
            <div class="flex items-center justify-between {totalDueSoon > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'} mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider">{t('stat_due', $lang)}</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-lg font-black leading-none {totalDueSoon > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}">{totalDueSoon}</span>
          </div>
        </div>

        <!-- Search Input with Glassmorphic Feel -->
        <div class="relative">
          <svg class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder={t('search_placeholder', $lang)}
            class="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all"
          />
          {#if searchQuery}
            <button on:click={() => searchQuery = ''} class="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>

        <!-- Filter Chips (Thumb Friendly Scrollable Row) -->
        <div class="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1 text-xs scrollbar-none">
          {#each [
            { id: 'All', label: t('filter_all', $lang) },
            { id: 'Website', label: t('filter_website', $lang) },
            { id: 'Database', label: t('filter_database', $lang) },
            { id: 'QR Code', label: t('filter_qrcode', $lang) },
            { id: 'Due Soon', label: t('filter_due', $lang) }
          ] as f}
            <button
              type="button"
              on:click={() => { triggerHaptic(); selectedFilter = f.id; }}
              class="touch-press px-3.5 py-2 rounded-xl whitespace-nowrap font-bold text-xs transition-all {selectedFilter === f.id ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/90 dark:border-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-850'}"
            >
              {f.label}
            </button>
          {/each}
        </div>

        <!-- Renewals Cards List -->
        {#if filteredRenewals.length === 0}
          <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 text-center shadow-sm">
            <div class="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center mb-3.5">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-200">{t('empty_renewals_title', $lang)}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">{t('empty_renewals_desc', $lang)}</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each filteredRenewals as renewal (renewal.id)}
              <RenewalCard
                {renewal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRenew={handleRenew}
              />
            {/each}
          </div>
        {/if}
      </div>

    {:else if $activeTab === 'quotes'}
      <QuoteBuilder />

    {:else if $activeTab === 'services'}
      <ServicesManager />

    {:else if $activeTab === 'alerts'}
      <NotificationCenter />

    {:else if $activeTab === 'settings'}
      <SettingsModal />
    {/if}
  </main>

  <!-- Bottom Navigation Bar -->
  <BottomNav />

  <!-- Add/Edit Renewal Modal -->
  {#if isModalOpen}
    <RenewalModal
      item={editingRenewal}
      onClose={() => isModalOpen = false}
    />
  {/if}

  <!-- Toast Notification Overlay -->
  {#if $toast.visible}
    <div class="fixed top-16 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div class="px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md border animate-bounce pointer-events-auto {$toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-500/50' : $toast.type === 'warning' ? 'bg-amber-950/90 text-amber-200 border-amber-500/50' : $toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50' : 'bg-sky-950/90 text-sky-200 border-sky-500/50'}">
        {$toast.message}
      </div>
    </div>
  {/if}
</div>
