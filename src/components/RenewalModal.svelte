<script>
  import { config } from '../lib/stores.js';
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
      alert('Please fill in client name and item/domain name.');
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
  <div class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
      <div>
        <h2 class="text-base font-bold text-white">{item ? 'Edit Renewal' : 'New Renewal Entry'}</h2>
        <p class="text-xs text-slate-400">Track websites, QR codes, or Manager.io databases</p>
      </div>
      <button on:click={onClose} class="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Scrollable Body -->
    <div class="p-5 overflow-y-auto space-y-4 text-sm">
      <!-- Type Selector Chips -->
      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Service Classification</label>
        <div class="grid grid-cols-3 gap-2">
          {#each ['Website', 'QR Code', 'Database'] as t}
            <button
              type="button"
              on:click={() => { triggerHaptic(); type = t; }}
              class="touch-press py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all {type === t ? 'bg-sky-600/20 border-sky-500 text-sky-400 ring-1 ring-sky-500' : 'bg-slate-800/80 border-slate-700/80 text-slate-300'}"
            >
              <span>{t === 'Database' ? '💾 Database' : t === 'QR Code' ? '📱 QR Code' : '🌐 Website'}</span>
            </button>
          {/each}
        </div>
        {#if type === 'Database'}
          <p class="text-[11px] text-emerald-400/90 mt-1.5">For Manager.io clients' database subscriptions and hosting.</p>
        {/if}
      </div>

      <!-- Client Name -->
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Client Name *</label>
        <input
          type="text"
          bind:value={client}
          placeholder="e.g. Al-Mansour Trading"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
        />
      </div>

      <!-- Item / Domain -->
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">
          {type === 'Database' ? 'Database / Company Name *' : type === 'QR Code' ? 'Campaign / QR Title *' : 'Domain / Website Name *'}
        </label>
        <input
          type="text"
          bind:value={itemName}
          placeholder={type === 'Database' ? 'e.g. Manager.io Production DB' : type === 'QR Code' ? 'e.g. VIP Menu QR Code' : 'e.g. tekno-labs.com'}
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
        />
      </div>

      <!-- Expiry Date & Quick Adjusters -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs font-semibold text-slate-300">Renewal / Expiry Date *</label>
          <div class="flex items-center space-x-1.5">
            <button type="button" on:click={() => addMonths(1)} class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">+1 Mo</button>
            <button type="button" on:click={() => addYears(1)} class="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">+1 Yr</button>
          </div>
        </div>
        <input
          type="date"
          bind:value={expiryDate}
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500 text-sm"
        />
      </div>

      <!-- Cycle & Provider -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Cycle</label>
          <select
            bind:value={cycle}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 text-sm"
          >
            <option value="Annual">Annual</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="One-time">One-time</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Provider / Host</label>
          <input
            type="text"
            bind:value={provider}
            placeholder="e.g. Cloudflare, VPS 1"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>
      </div>

      <!-- Price & Cost -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Price Charged ({$config.currency})</label>
          <input
            type="number"
            step="any"
            bind:value={price}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Direct Cost ({$config.currency})</label>
          <input
            type="number"
            step="any"
            bind:value={cost}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>
      </div>

      <!-- Google Calendar Sync Toggle -->
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div class="flex items-center space-x-2.5">
          <div class="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div class="text-xs font-semibold text-white">Google Calendar Auto-Sync</div>
            <div class="text-[11px] text-slate-400">Pushes 7-day advance reminder alert</div>
          </div>
        </div>
        <input
          type="checkbox"
          bind:checked={syncCalendar}
          class="w-5 h-5 rounded text-sky-600 bg-slate-900 border-slate-700 focus:ring-0"
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Notes / Instructions</label>
        <textarea
          rows="2"
          bind:value={notes}
          placeholder="Client contact notes, server IP, credentials reference..."
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
        ></textarea>
      </div>
    </div>

    <!-- Footer Action -->
    <div class="p-4 border-t border-slate-800 bg-slate-900/95 pb-safe">
      <button
        type="button"
        on:click={handleSave}
        class="touch-press w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{item ? 'Save Renewal Changes' : 'Save & Sync Renewal'}</span>
      </button>
    </div>
  </div>
</div>
