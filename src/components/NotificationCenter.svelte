<script>
  import { renewals, config } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { apiSaveRenewal } from '../lib/api.js';
  import { daysUntil, formatDate, formatMoney, getUrgency, triggerHaptic } from '../lib/utils.js';

  let selectedAlertTab = 'All';

  $: itemsWithUrgency = ($renewals || [])
    .map(r => {
      const daysLeft = daysUntil(r.expiryDate);
      const rawUrgency = getUrgency(daysLeft);
      return {
        ...r,
        daysLeft,
        urgency: {
          ...rawUrgency,
          label: $lang === 'ku'
            ? (daysLeft < 0 ? `${Math.abs(daysLeft)} ڕۆژ بەسەرچووە` : daysLeft === 0 ? 'ئەمڕۆ بەسەردەچێت!' : `${daysLeft} ڕۆژی ماوە`)
            : rawUrgency.label
        }
      };
    })
    .filter(r => r.status !== 'Renewed')
    .sort((a, b) => a.daysLeft - b.daysLeft);

  $: expired = itemsWithUrgency.filter(i => i.daysLeft < 0);
  $: dueWithin7 = itemsWithUrgency.filter(i => i.daysLeft >= 0 && i.daysLeft <= 7);
  $: dueWithin14 = itemsWithUrgency.filter(i => i.daysLeft > 7 && i.daysLeft <= 14);
  $: dueWithin30 = itemsWithUrgency.filter(i => i.daysLeft > 14 && i.daysLeft <= 30);

  $: displayedItems = selectedAlertTab === 'Expired'
    ? expired
    : selectedAlertTab === '7d'
    ? dueWithin7
    : selectedAlertTab === '14d'
    ? dueWithin14
    : selectedAlertTab === '30d'
    ? dueWithin30
    : itemsWithUrgency;

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
    const text = $lang === 'ku'
      ? `سڵاو بەڕێز ${item.client}،\nئەمە ئاگاداری نوێکردنەوەیە لەلایەن کۆمپانیای Tekno Labs سەبارەت بە ${item.type} (${item.item}).\nبەرواری نوێکردنەوە: ${item.expiryDate}\nبڕی پارە: ${formatMoney(item.price, $config.currency)}\nتکایە ئاگادارمان بکەنەوە ئەگەر ئارەزووی بەردەوامبوونی خزمەتگوزارییەکەت دەکەیت.`
      : `Hello ${item.client},\nThis is a renewal reminder from Tekno Labs regarding your ${item.type} (${item.item}).\nRenewal Date: ${item.expiryDate}\nAmount: ${formatMoney(item.price, $config.currency)}\nPlease let us know if you would like to proceed with the renewal.`;
    
    if (navigator.share) {
      navigator.share({ title: `Renewal Reminder - ${item.item}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert($lang === 'ku' ? 'پەیامی ئاگاداری کۆپی کرا!' : 'Reminder message copied to clipboard!');
    }
  }
</script>

<div class="space-y-4 pb-24">
  <!-- Heading & Overview Summary -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('alerts_title', $lang)}</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('alerts_subtitle', $lang)}</p>
    </div>
    {#if itemsWithUrgency.length > 0}
      <span class="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        {itemsWithUrgency.length} {$lang === 'ku' ? 'ئاگاداری' : 'Alerts'}
      </span>
    {/if}
  </div>

  {#if itemsWithUrgency.length === 0}
    <!-- All Clear Empty State -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 text-center shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3.5">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">{t('alerts_empty_title', $lang)}</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">{t('alerts_empty_desc', $lang)}</p>
    </div>
  {:else}
    <!-- Category Filter Chips -->
    <div class="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1 text-xs scrollbar-none">
      <button
        type="button"
        on:click={() => { triggerHaptic(); selectedAlertTab = 'All'; }}
        class="touch-press px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap {selectedAlertTab === 'All' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}"
      >
        {$lang === 'ku' ? 'هەموو' : 'All'} ({itemsWithUrgency.length})
      </button>

      {#if expired.length > 0}
        <button
          type="button"
          on:click={() => { triggerHaptic(); selectedAlertTab = 'Expired'; }}
          class="touch-press px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap {selectedAlertTab === 'Expired' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'}"
        >
          {t('alerts_expired', $lang)} ({expired.length})
        </button>
      {/if}

      {#if dueWithin7.length > 0}
        <button
          type="button"
          on:click={() => { triggerHaptic(); selectedAlertTab = '7d'; }}
          class="touch-press px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap {selectedAlertTab === '7d' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'}"
        >
          ≤ 7d ({dueWithin7.length})
        </button>
      {/if}

      {#if dueWithin14.length > 0}
        <button
          type="button"
          on:click={() => { triggerHaptic(); selectedAlertTab = '14d'; }}
          class="touch-press px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap {selectedAlertTab === '14d' ? 'bg-sky-600 text-white shadow-sm' : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40'}"
        >
          ≤ 14d ({dueWithin14.length})
        </button>
      {/if}

      {#if dueWithin30.length > 0}
        <button
          type="button"
          on:click={() => { triggerHaptic(); selectedAlertTab = '30d'; }}
          class="touch-press px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap {selectedAlertTab === '30d' ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}"
        >
          ≤ 30d ({dueWithin30.length})
        </button>
      {/if}
    </div>

    <!-- Alert Cards List -->
    <div class="space-y-3">
      {#each displayedItems as item (item.id)}
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm hover:shadow transition-all border-l-4 rtl:border-l rtl:border-r-4 {item.daysLeft < 0 ? 'border-l-rose-500 rtl:border-r-rose-500 bg-rose-500/[0.02]' : item.daysLeft <= 7 ? 'border-l-amber-500 rtl:border-r-amber-500 bg-amber-500/[0.02]' : 'border-l-sky-500 rtl:border-r-sky-500'}">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white truncate">{item.client}</h3>
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.item} • {item.type}</p>
            </div>
            <span class="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-full text-xs font-bold border {item.urgency.badgeClass} flex-shrink-0">
              <span class="w-1.5 h-1.5 rounded-full {item.urgency.dotClass} {item.daysLeft <= 7 ? 'animate-ping' : ''}"></span>
              <span>{item.urgency.label}</span>
            </span>
          </div>

          <!-- Date & Pricing -->
          <div class="flex items-center justify-between text-xs py-2 border-t border-slate-100 dark:border-slate-800/80">
            <div class="text-slate-600 dark:text-slate-400 font-medium flex items-center space-x-1.5 rtl:space-x-reverse">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(item.expiryDate)}</span>
            </div>
            <span class="font-black text-slate-900 dark:text-white text-sm">{formatMoney(item.price, $config.currency)}</span>
          </div>

          <!-- Quick Thumb Actions -->
          <div class="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              on:click={() => shareReminder(item)}
              class="touch-press min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
            >
              <svg class="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{t('alerts_share', $lang)}</span>
            </button>

            <button
              type="button"
              on:click={() => quickRenew(item)}
              class="touch-press min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center space-x-1.5 rtl:space-x-reverse transition-colors active:scale-95"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t('alerts_renew1yr', $lang)}</span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
