<script>
  import { renewals, config } from '../lib/stores.js';
  import { apiSaveRenewal } from '../lib/api.js';
  import { daysUntil, formatDate, formatMoney, getUrgency, triggerHaptic } from '../lib/utils.js';

  $: itemsWithUrgency = ($renewals || [])
    .map(r => ({
      ...r,
      daysLeft: daysUntil(r.expiryDate),
      urgency: getUrgency(daysUntil(r.expiryDate))
    }))
    .filter(r => r.status !== 'Renewed')
    .sort((a, b) => a.daysLeft - b.daysLeft);

  $: expired = itemsWithUrgency.filter(i => i.daysLeft < 0);
  $: dueWithin7 = itemsWithUrgency.filter(i => i.daysLeft >= 0 && i.daysLeft <= 7);
  $: dueWithin14 = itemsWithUrgency.filter(i => i.daysLeft > 7 && i.daysLeft <= 14);
  $: dueWithin30 = itemsWithUrgency.filter(i => i.daysLeft > 14 && i.daysLeft <= 30);

  async function quickRenew(item) {
    triggerHaptic();
    const curDate = new Date(item.expiryDate || Date.now());
    curDate.setFullYear(curDate.getFullYear() + 1);
    const updated = {
      ...item,
      expiryDate: curDate.toISOString().slice(0, 10),
      status: 'Renewed'
    };
    await apiSaveRenewal(updated, true);
  }

  function shareReminder(item) {
    triggerHaptic();
    const text = `Hello ${item.client},\nThis is a renewal reminder from Tekno Labs regarding your ${item.type} (${item.item}).\nRenewal Date: ${item.expiryDate}\nAmount: ${formatMoney(item.price, $config.currency)}\nPlease let us know if you would like to proceed with the renewal.`;
    if (navigator.share) {
      navigator.share({ title: `Renewal Reminder - ${item.item}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Reminder message copied to clipboard!');
    }
  }
</script>

<div class="space-y-4 pb-nav">
  <div>
    <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Notification & Alert Center</h2>
    <p class="text-xs text-slate-500 dark:text-slate-400">Automated deadline tracking & 7-day advance reminders</p>
  </div>

  {#if itemsWithUrgency.length === 0}
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
      <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">All Renewals Up-To-Date!</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">No services due for renewal in the immediate 30-day window.</p>
    </div>
  {:else}
    <!-- Expired Section -->
    {#if expired.length > 0}
      <div class="space-y-2">
        <div class="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Expired Assets ({expired.length})</span>
        </div>
        {#each expired as item}
          <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 rounded-2xl p-3.5 space-y-2 shadow-sm">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white">{item.client}</span>
                <div class="text-[11px] text-red-600 dark:text-red-300">{item.item} ({item.type})</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30">
                {item.urgency.label}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-red-200 dark:border-red-900/40">
              <span class="text-slate-700 dark:text-slate-300 font-semibold">{formatMoney(item.price, $config.currency)}</span>
              <div class="flex items-center space-x-2">
                <button on:click={() => shareReminder(item)} class="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">Share</button>
                <button on:click={() => quickRenew(item)} class="text-[11px] px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold">Renew +1Yr</button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Critical Section: < 7 Days -->
    {#if dueWithin7.length > 0}
      <div class="space-y-2">
        <div class="flex items-center space-x-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Urgent: Due in 7 Days ({dueWithin7.length})</span>
        </div>
        {#each dueWithin7 as item}
          <div class="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-3.5 space-y-2 shadow-sm">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white">{item.client}</span>
                <div class="text-[11px] text-rose-600 dark:text-rose-300">{item.item} ({item.type})</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                {item.urgency.label}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-rose-200 dark:border-rose-900/40">
              <span class="text-slate-700 dark:text-slate-300 font-semibold">{formatMoney(item.price, $config.currency)}</span>
              <div class="flex items-center space-x-2">
                <button on:click={() => shareReminder(item)} class="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">Share</button>
                <button on:click={() => quickRenew(item)} class="text-[11px] px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold">Renew +1Yr</button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Upcoming Section: 8 - 14 Days -->
    {#if dueWithin14.length > 0}
      <div class="space-y-2">
        <div class="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Due Within 2 Weeks ({dueWithin14.length})</span>
        </div>
        {#each dueWithin14 as item}
          <div class="bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-3.5 space-y-2 shadow-sm">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white">{item.client}</span>
                <div class="text-[11px] text-slate-600 dark:text-slate-400">{item.item} ({item.type})</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                {item.urgency.label}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
              <span class="text-slate-700 dark:text-slate-300 font-semibold">{formatMoney(item.price, $config.currency)}</span>
              <div class="flex items-center space-x-2">
                <button on:click={() => shareReminder(item)} class="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">Share</button>
                <button on:click={() => quickRenew(item)} class="text-[11px] px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold">Renew +1Yr</button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Upcoming Section: 15 - 30 Days -->
    {#if dueWithin30.length > 0}
      <div class="space-y-2">
        <div class="flex items-center space-x-2 text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span>Due This Month ({dueWithin30.length})</span>
        </div>
        {#each dueWithin30 as item}
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">{item.client}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">{item.item} • {formatDate(item.expiryDate)}</div>
            </div>
            <span class="text-xs font-semibold text-yellow-600 dark:text-yellow-300">{item.daysLeft}d left</span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
