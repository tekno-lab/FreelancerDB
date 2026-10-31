<script>
  import { config } from '../lib/stores.js';
  import { daysUntil, formatDate, formatMoney, getUrgency, triggerHaptic } from '../lib/utils.js';

  export let renewal;
  export let onEdit = () => {};
  export let onDelete = () => {};
  export let onRenew = () => {};

  $: daysLeft = daysUntil(renewal.expiryDate);
  $: urgency = getUrgency(daysLeft);
  $: profit = (Number(renewal.price) || 0) - (Number(renewal.cost) || 0);

  function getTypeStyle(type) {
    switch (type) {
      case 'Database':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'QR Code':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Website':
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
  }

  function getTypeIcon(type) {
    switch (type) {
      case 'Database':
        return 'M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zm0 5c1.5 1 4 1.5 8 1.5s6.5-.5 8-1.5M4 7c1.5 1 4 1.5 8 1.5S18.5 8 20 7';
      case 'QR Code':
        return 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z';
      case 'Website':
      default:
        return 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9';
    }
  }
</script>

<div class="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-sm transition-all relative overflow-hidden">
  <!-- Top Row: Client & Status Countdown -->
  <div class="flex items-start justify-between gap-2 mb-2">
    <div>
      <div class="flex items-center space-x-1.5">
        <h3 class="text-base font-bold text-white tracking-tight">{renewal.client}</h3>
      </div>
      <div class="text-xs text-sky-400 font-medium truncate max-w-[210px] mt-0.5">
        {renewal.item}
      </div>
    </div>

    <!-- Urgency Badge -->
    <div class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border {urgency.badgeClass}">
      <span class="w-1.5 h-1.5 rounded-full {urgency.dotClass}"></span>
      <span>{urgency.label}</span>
    </div>
  </div>

  <!-- Middle Row: Type & Expiry Info -->
  <div class="flex flex-wrap items-center gap-1.5 text-xs my-2.5">
    <!-- Type Badge -->
    <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-medium border {getTypeStyle(renewal.type)}">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getTypeIcon(renewal.type)} />
      </svg>
      <span>{renewal.type}</span>
    </span>

    <!-- Cycle -->
    <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
      {renewal.cycle || 'Annual'}
    </span>

    <!-- Expiry Date -->
    <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center space-x-1">
      <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{formatDate(renewal.expiryDate)}</span>
    </span>

    <!-- Calendar Sync Icon -->
    {#if renewal.calendarEventId}
      <span class="px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/40 text-[10px] flex items-center space-x-1" title="Synced with Google Calendar (7d reminder)">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>GCal 7d</span>
      </span>
    {/if}
  </div>

  <!-- Financials Row -->
  <div class="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80 text-xs">
    <div class="flex items-center space-x-3">
      <div>
        <span class="text-slate-400 block text-[10px]">Price Charged</span>
        <span class="font-bold text-white text-sm">{formatMoney(renewal.price, $config.currency)}</span>
      </div>
      <div class="border-l border-slate-800 pl-3">
        <span class="text-slate-400 block text-[10px]">Cost</span>
        <span class="text-slate-300 font-medium">{formatMoney(renewal.cost, $config.currency)}</span>
      </div>
      <div class="border-l border-slate-800 pl-3">
        <span class="text-slate-400 block text-[10px]">Profit</span>
        <span class="text-emerald-400 font-semibold">+{formatMoney(profit, $config.currency)}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center space-x-1">
      <button
        on:click={() => { triggerHaptic(); onRenew(renewal); }}
        title="Renew (+1 Year)"
        class="touch-press px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold"
      >
        Renew
      </button>

      <button
        on:click={() => { triggerHaptic(); onEdit(renewal); }}
        title="Edit Renewal"
        class="touch-press p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <button
        on:click={() => { triggerHaptic(); onDelete(renewal); }}
        title="Delete Renewal"
        class="touch-press p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700/60"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>

  {#if renewal.notes}
    <div class="mt-2 text-[11px] text-slate-400 bg-slate-950/60 rounded-lg p-2 border border-slate-800/40 line-clamp-2">
      {renewal.notes}
    </div>
  {/if}
</div>
