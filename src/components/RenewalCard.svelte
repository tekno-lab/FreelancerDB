<script>
  import { config } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { daysUntil, formatDate, formatMoney, getUrgency, triggerHaptic } from '../lib/utils.js';

  export let renewal;
  export let onEdit = () => {};
  export let onDelete = () => {};
  export let onRenew = () => {};

  $: daysLeft = daysUntil(renewal.expiryDate);
  $: rawUrgency = getUrgency(daysLeft);
  $: urgency = {
    ...rawUrgency,
    label: $lang === 'ku'
      ? (daysLeft < 0 ? `${Math.abs(daysLeft)} ڕۆژ بەسەرچووە` : daysLeft === 0 ? 'ئەمڕۆ بەسەردەچێت!' : `${daysLeft} ڕۆژی ماوە`)
      : rawUrgency.label
  };
  $: profit = (Number(renewal.price) || 0) - (Number(renewal.cost) || 0);

  // Dynamic urgency border & glow
  $: borderUrgencyClass = daysLeft < 0
    ? 'border-l-rose-500 rtl:border-l-0 rtl:border-r-rose-500 bg-rose-500/[0.02]'
    : daysLeft <= 7
    ? 'border-l-amber-500 rtl:border-l-0 rtl:border-r-amber-500 bg-amber-500/[0.02]'
    : daysLeft <= 30
    ? 'border-l-sky-500 rtl:border-l-0 rtl:border-r-sky-500'
    : 'border-l-emerald-500/80 rtl:border-l-0 rtl:border-r-emerald-500/80';

  function getTypeStyle(type) {
    switch (type) {
      case 'Database':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
      case 'QR Code':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
      case 'Website':
      default:
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25';
    }
  }

  function getTypeLabel(type) {
    if ($lang === 'ku') {
      if (type === 'Database') return 'داتابەیس';
      if (type === 'QR Code') return 'کۆدی QR';
      if (type === 'Website') return 'وێبسایت';
    }
    return type;
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

<div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden border-l-4 rtl:border-l rtl:border-r-4 {borderUrgencyClass}">
  <!-- Top Header Row: Client & Status Countdown -->
  <div class="flex items-start justify-between gap-2.5 mb-2.5">
    <div class="min-w-0 flex-1">
      <div class="flex items-center space-x-1.5 rtl:space-x-reverse">
        <h3 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
          {renewal.client}
        </h3>
      </div>
      <div class="text-xs text-sky-600 dark:text-sky-400 font-semibold truncate mt-1 flex items-center space-x-1 rtl:space-x-reverse">
        <svg class="w-3.5 h-3.5 flex-shrink-0 text-sky-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span class="truncate">{renewal.item}</span>
      </div>
    </div>

    <!-- Urgency Badge -->
    <div class="flex-shrink-0 inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs {urgency.badgeClass}">
      <span class="w-1.5 h-1.5 rounded-full {urgency.dotClass} {daysLeft <= 7 ? 'animate-ping' : ''}"></span>
      <span class="whitespace-nowrap">{urgency.label}</span>
    </div>
  </div>

  <!-- Middle Row: Metadata Pills -->
  <div class="flex flex-wrap items-center gap-1.5 text-xs my-2.5">
    <!-- Type Badge -->
    <span class="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-lg font-semibold border {getTypeStyle(renewal.type)}">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getTypeIcon(renewal.type)} />
      </svg>
      <span>{getTypeLabel(renewal.type)}</span>
    </span>

    <!-- Cycle Badge -->
    <span class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium">
      {renewal.cycle || 'Annual'}
    </span>

    <!-- Expiry Date -->
    <span class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center space-x-1 rtl:space-x-reverse font-medium">
      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{formatDate(renewal.expiryDate)}</span>
    </span>

    <!-- Calendar Sync Icon -->
    {#if renewal.calendarEventId}
      <span class="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40 text-[11px] font-semibold flex items-center space-x-1 rtl:space-x-reverse" title="Synced with Google Calendar (7-day advance reminder)">
        <svg class="w-3 h-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <span>{t('card_gcal_synced', $lang)}</span>
      </span>
    {/if}
  </div>

  <!-- Financials & Quick Actions Row -->
  <div class="flex items-center justify-between pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-800/90 gap-2">
    <!-- Financial Numbers -->
    <div class="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
      <div>
        <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-medium uppercase tracking-wider">{t('card_price', $lang)}</span>
        <span class="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{formatMoney(renewal.price, $config.currency)}</span>
      </div>

      <div class="border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 pl-2.5 rtl:pl-0 rtl:pr-2.5">
        <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-medium uppercase tracking-wider">{t('card_cost', $lang)}</span>
        <span class="text-slate-600 dark:text-slate-400 font-semibold text-xs">{formatMoney(renewal.cost, $config.currency)}</span>
      </div>

      <div class="border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 pl-2.5 rtl:pl-0 rtl:pr-2.5">
        <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-medium uppercase tracking-wider">{t('card_profit', $lang)}</span>
        <span class="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block">
          +{formatMoney(profit, $config.currency)}
        </span>
      </div>
    </div>

    <!-- Thumb-Friendly Action Buttons (Min 40px touch height) -->
    <div class="flex items-center space-x-1.5 rtl:space-x-reverse flex-shrink-0">
      <!-- Quick Renew (+1y) Button -->
      <button
        type="button"
        on:click={() => { triggerHaptic(); onRenew(renewal); }}
        title={t('card_renew', $lang)}
        class="touch-press min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 flex items-center space-x-1 rtl:space-x-reverse transition-all"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{t('card_renew', $lang)}</span>
      </button>

      <!-- Edit Button -->
      <button
        type="button"
        on:click={() => { triggerHaptic(); onEdit(renewal); }}
        title={t('card_edit', $lang)}
        class="touch-press min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/70 active:scale-95 flex items-center justify-center transition-all"
        aria-label={t('card_edit', $lang)}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <!-- Delete Button -->
      <button
        type="button"
        on:click={() => { triggerHaptic(); onDelete(renewal); }}
        title={t('card_delete', $lang)}
        class="touch-press min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/70 active:scale-95 flex items-center justify-center transition-all"
        aria-label={t('card_delete', $lang)}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Notes Callout (if available) -->
  {#if renewal.notes}
    <div class="mt-2.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800/80 flex items-start space-x-1.5 rtl:space-x-reverse">
      <svg class="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span class="line-clamp-2 leading-relaxed">{renewal.notes}</span>
    </div>
  {/if}
</div>
