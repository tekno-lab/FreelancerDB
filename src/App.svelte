<script>
  import { onMount } from 'svelte';
  import { renewals, activeTab, toast, isLoading, config } from './lib/stores.js';
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
  $: filteredRenewals = $renewals.filter(r => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      r.client?.toLowerCase().includes(q) ||
      r.item?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q);

    if (!matchSearch) return false;

    // Category / Status Filter
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Due Soon') {
      const d = daysUntil(r.expiryDate);
      return d <= 14 && r.status !== 'Renewed';
    }
    return r.type === selectedFilter;
  });

  // Summary Metrics
  $: totalActive = $renewals.filter(r => r.status !== 'Expired').length;
  $: totalRevenue = $renewals.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  $: totalDueSoon = $renewals.filter(r => daysUntil(r.expiryDate) <= 14 && r.status !== 'Renewed').length;

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
    if (confirm(`Delete renewal for ${r.client} (${r.item})?`)) {
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

<div class="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
  <!-- Top App Bar -->
  <Header onOpenNewModal={openNewModal} />

  <!-- Main Scrollable Content Area -->
  <main class="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
    {#if $activeTab === 'renewals'}
      <div class="space-y-4 pb-nav">
        <!-- Overview Stat Cards -->
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Tracked</span>
            <span class="text-base font-black text-white">{totalActive}</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Revenue</span>
            <span class="text-xs font-black text-sky-400">{formatMoney(totalRevenue, $config.currency)}</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center {totalDueSoon > 0 ? 'border-amber-500/40 bg-amber-950/20' : ''}">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Due ≤14d</span>
            <span class="text-base font-black {totalDueSoon > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}">{totalDueSoon}</span>
          </div>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <svg class="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search client, domain, or database..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          {#if searchQuery}
            <button on:click={() => searchQuery = ''} class="absolute right-3 top-2.5 text-slate-400 hover:text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>

        <!-- Filter Chips (Thumb Friendly) -->
        <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {#each ['All', 'Website', 'Database', 'QR Code', 'Due Soon'] as f}
            <button
              type="button"
              on:click={() => { triggerHaptic(); selectedFilter = f; }}
              class="touch-press px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all {selectedFilter === f ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'bg-slate-900 text-slate-400 border border-slate-800'}"
            >
              {f === 'Database' ? '💾 Databases' : f === 'QR Code' ? '📱 QR Codes' : f === 'Website' ? '🌐 Websites' : f}
            </button>
          {/each}
        </div>

        <!-- Renewals Cards List -->
        {#if filteredRenewals.length === 0}
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p class="text-sm font-semibold text-slate-300">No renewals found</p>
            <p class="text-xs text-slate-500 mt-1">Tap the "Add" button to track a new website, QR code, or Manager.io database.</p>
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
