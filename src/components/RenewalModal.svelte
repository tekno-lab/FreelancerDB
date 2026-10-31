<script>
  import { config } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { apiSaveRenewal } from '../lib/api.js';
  import { triggerHaptic } from '../lib/utils.js';

  export let item = null;
  export let onClose = () => {};

  let client = item?.client || '';
  let itemName = item?.item || '';
  let type = item?.type || 'Website';
  let expiryDate = item?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  let cycle = item?.cycle || 'Annual';
  let cost = item?.cost ?? 0;
  let price = item?.price ?? 150;
  let provider = item?.provider || '';
  let notes = item?.notes || '';
  let syncCalendar = true;

  function addYears(y) {
    triggerHaptic();
    const cur = new Date(expiryDate || Date.now());
    cur.setFullYear(cur.getFullYear() + y);
    expiryDate = cur.toISOString().slice(0, 10);
  }

  function addMonths(m) {
    triggerHaptic();
    const cur = new Date(expiryDate || Date.now());
    cur.setMonth(cur.getMonth() + m);
    expiryDate = cur.toISOString().slice(0, 10);
  }

  async function handleSave() {
    triggerHaptic();
    if (!client.trim() || !itemName.trim()) {
      alert($lang === 'ku' ? 'تکایە ناوی کڕیار و ناوی دۆمەین/پڕۆژە بنووسە.' : 'Please fill in client name and item/domain name.');
      return;
    }

    const payload = {
      id: item?.id,
      client: client.trim(),
      item: itemName.trim(),
      type,
      expiryDate,
      cycle,
      cost: Number(cost) || 0,
      price: Number(price) || 0,
      provider: provider.trim(),
      notes: notes.trim(),
      calendarEventId: item?.calendarEventId || ''
    };

    await apiSaveRenewal(payload, syncCalendar);
    onClose();
  }
</script>

<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
  <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">{item ? t('modal_title_edit', $lang) : t('modal_title_new', $lang)}</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">{t('modal_subtitle', $lang)}</p>
      </div>
      <button on:click={onClose} class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Scrollable Body -->
    <div class="p-5 overflow-y-auto space-y-4 text-sm">
      <!-- Type Selector Chips -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">{t('modal_class', $lang)}</label>
        <div class="grid grid-cols-3 gap-2">
          {#each ['Website', 'QR Code', 'Database'] as tType}
            <button
              type="button"
              on:click={() => { triggerHaptic(); type = tType; }}
              class="touch-press py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-all {type === tType ? 'bg-sky-600/20 border-sky-500 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'}"
            >
              <span>{tType === 'Database' ? '💾 ' + ($lang === 'ku' ? 'داتابەیس' : 'Database') : tType === 'QR Code' ? '📱 ' + ($lang === 'ku' ? 'کۆدی QR' : 'QR Code') : '🌐 ' + ($lang === 'ku' ? 'وێبسایت' : 'Website')}</span>
            </button>
          {/each}
        </div>
        {#if type === 'Database'}
          <p class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5">{t('modal_class_db_note', $lang)}</p>
        {/if}
      </div>

      <!-- Client Name -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('modal_client', $lang)}</label>
        <input
          type="text"
          bind:value={client}
          placeholder="e.g. Al-Mansour Trading"
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm"
        />
      </div>

      <!-- Item / Domain -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {type === 'Database' ? t('modal_item_db', $lang) : type === 'QR Code' ? t('modal_item_qr', $lang) : t('modal_item', $lang)}
        </label>
        <input
          type="text"
          bind:value={itemName}
          placeholder={type === 'Database' ? 'e.g. Manager.io Production DB' : type === 'QR Code' ? 'e.g. VIP Menu QR Code' : 'e.g. tekno-labs.com'}
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm"
        />
      </div>

      <!-- Expiry Date & Quick Adjusters -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t('modal_expiry', $lang)}</label>
          <div class="flex items-center space-x-1.5 rtl:space-x-reverse">
            <button type="button" on:click={() => addMonths(1)} class="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">+1 Mo</button>
            <button type="button" on:click={() => addYears(1)} class="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">+1 Yr</button>
          </div>
        </div>
        <input
          type="date"
          bind:value={expiryDate}
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm"
        />
      </div>

      <!-- Cycle & Provider -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('modal_cycle', $lang)}</label>
          <select
            bind:value={cycle}
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm"
          >
            <option value="Annual">{$lang === 'ku' ? 'ساڵانە' : 'Annual'}</option>
            <option value="Monthly">{$lang === 'ku' ? 'مانگانە' : 'Monthly'}</option>
            <option value="Quarterly">{$lang === 'ku' ? 'سێ مانگانە' : 'Quarterly'}</option>
            <option value="One-time">{$lang === 'ku' ? 'یەکجار' : 'One-time'}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('modal_provider', $lang)}</label>
          <input
            type="text"
            bind:value={provider}
            placeholder="e.g. Cloudflare, VPS 1"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>
      </div>

      <!-- Price & Cost -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('modal_price', $lang)} ({$config.currency})</label>
          <input
            type="number"
            step="any"
            bind:value={price}
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('modal_cost', $lang)} ({$config.currency})</label>
          <input
            type="number"
            step="any"
            bind:value={cost}
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>
      </div>

      <!-- Google Calendar Sync Toggle -->
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
        <div class="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div class="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-900 dark:text-white">{t('modal_gcal_title', $lang)}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">{t('modal_gcal_desc', $lang)}</div>
          </div>
        </div>
        <input
          type="checkbox"
          bind:checked={syncCalendar}
          class="w-5 h-5 rounded text-sky-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-0"
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('modal_notes', $lang)}</label>
        <textarea
          rows="2"
          bind:value={notes}
          placeholder="Client contact notes, server IP, credentials reference..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm"
        ></textarea>
      </div>
    </div>

    <!-- Footer Action -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 pb-safe">
      <button
        type="button"
        on:click={handleSave}
        class="touch-press w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 rtl:space-x-reverse"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{item ? t('modal_save_changes', $lang) : t('modal_save', $lang)}</span>
      </button>
    </div>
  </div>
</div>
