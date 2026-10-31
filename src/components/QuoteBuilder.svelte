<script>
  import { config, services, quotes, isLoading } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { apiGenerateQuote } from '../lib/api.js';
  import { formatMoney, triggerHaptic } from '../lib/utils.js';

  let clientName = '';
  let clientEmail = '';
  let clientPhone = '';
  let selectedItems = [];
  let discount = 0;
  let notes = 'Payment terms: 50% upfront, 50% upon deployment.\nValidity: 30 days.';
  let generatedPdfUrl = '';
  let lastQuoteNumber = '';

  // Filter active services
  $: catalog = ($services || []).filter(s => s.active);

  // Compute Subtotal & Total
  $: subtotal = selectedItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  $: total = Math.max(0, subtotal - (Number(discount) || 0));

  function addItem(srv) {
    triggerHaptic();
    const existing = selectedItems.find(i => i.id === srv.id);
    if (existing) {
      existing.qty = (Number(existing.qty) || 1) + 1;
      selectedItems = [...selectedItems];
    } else {
      selectedItems = [...selectedItems, {
        id: srv.id,
        name: srv.name,
        desc: srv.description,
        price: Number(srv.price) || 0,
        qty: 1
      }];
    }
  }

  function changeQty(index, delta) {
    triggerHaptic();
    const item = selectedItems[index];
    const newQty = (Number(item.qty) || 1) + delta;
    if (newQty <= 0) {
      selectedItems = selectedItems.filter((_, i) => i !== index);
    } else {
      item.qty = newQty;
      selectedItems = [...selectedItems];
    }
  }

  function removeItem(index) {
    triggerHaptic();
    selectedItems = selectedItems.filter((_, i) => i !== index);
  }

  async function handleCompile() {
    triggerHaptic();
    if (!clientName.trim()) {
      alert($lang === 'ku' ? 'تکایە ناوی کڕیار بنووسە.' : 'Please enter client name for this quote.');
      return;
    }
    if (selectedItems.length === 0) {
      alert($lang === 'ku' ? 'تکایە لانیکەم خزمەتگوزارییەک هەڵبژێرە لە لیستەکە.' : 'Please add at least one service from the catalog below.');
      return;
    }

    const payload = {
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      items: selectedItems,
      subtotal,
      discount: Number(discount) || 0,
      total,
      currency: $config.currency,
      notes
    };

    const res = await apiGenerateQuote(payload);
    if (res?.pdfUrl) {
      generatedPdfUrl = res.pdfUrl;
      lastQuoteNumber = res.quoteNumber;
    }
  }

  function resetBuilder() {
    triggerHaptic();
    clientName = '';
    clientEmail = '';
    clientPhone = '';
    selectedItems = [];
    discount = 0;
    generatedPdfUrl = '';
    lastQuoteNumber = '';
  }
</script>

<div class="space-y-4 pb-nav">
  <!-- Heading -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('quotes_title', $lang)}</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400">{t('quotes_subtitle', $lang)}</p>
    </div>
    {#if selectedItems.length > 0 || generatedPdfUrl}
      <button on:click={resetBuilder} class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800">
        {t('quotes_clear', $lang)}
      </button>
    {/if}
  </div>

  <!-- Success Notification Card when PDF is compiled -->
  {#if generatedPdfUrl}
    <div class="bg-sky-50 dark:bg-gradient-to-r dark:from-sky-950/80 dark:to-slate-900 border border-sky-400/40 rounded-2xl p-4 shadow-lg text-sm">
      <div class="flex items-center space-x-2 rtl:space-x-reverse text-sky-600 dark:text-sky-400 font-bold mb-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{t('quotes_pdf_compiled', $lang)}</span>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 mb-3">Ref: <strong>{lastQuoteNumber}</strong> • {t('quotes_saved_in', $lang)}</p>

      <div class="flex items-center space-x-2 rtl:space-x-reverse">
        <a
          href={generatedPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="touch-press flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs text-center flex items-center justify-center space-x-1.5 rtl:space-x-reverse shadow"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{t('quotes_open_pdf', $lang)}</span>
        </a>

        <button
          on:click={() => {
            navigator.clipboard.writeText(generatedPdfUrl);
            alert($lang === 'ku' ? 'بەستەری فایلی PDF کۆپی کرا!' : 'PDF Google Drive link copied to clipboard!');
          }}
          class="touch-press p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
          title={t('quotes_copy_link', $lang)}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <!-- Client Details Section -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
    <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">{t('quotes_client_info', $lang)}</h3>
    <div class="space-y-2.5 text-xs">
      <div>
        <label class="block text-slate-600 dark:text-slate-400 mb-1">{t('quotes_client_name', $lang)}</label>
        <input
          type="text"
          bind:value={clientName}
          placeholder="e.g. Al-Basha Trading Co."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
        />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-slate-600 dark:text-slate-400 mb-1">{t('quotes_email', $lang)}</label>
          <input
            type="email"
            bind:value={clientEmail}
            placeholder="client@company.com"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            dir="ltr"
          />
        </div>
        <div>
          <label class="block text-slate-600 dark:text-slate-400 mb-1">{t('quotes_phone', $lang)}</label>
          <input
            type="tel"
            bind:value={clientPhone}
            placeholder="+964..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Selected Line Items -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
        {t('quotes_items', $lang)} ({selectedItems.length})
      </h3>
      {#if selectedItems.length > 0}
        <span class="text-xs font-bold text-sky-600 dark:text-sky-400">{formatMoney(total, $config.currency)}</span>
      {/if}
    </div>

    {#if selectedItems.length === 0}
      <div class="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <p class="text-xs text-slate-500 dark:text-slate-400">{t('quotes_no_items', $lang)}</p>
        <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t('quotes_no_items_hint', $lang)}</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each selectedItems as item, idx}
          <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">
                {formatMoney(item.price, $config.currency)} each
              </div>
            </div>

            <!-- Stepper Controls -->
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
              <div class="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <button
                  on:click={() => changeQty(idx, -1)}
                  class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="px-2 text-xs font-bold text-slate-800 dark:text-white min-w-[20px] text-center">{item.qty}</span>
                <button
                  on:click={() => changeQty(idx, 1)}
                  class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <!-- Line Total -->
              <div class="text-xs font-bold text-slate-900 dark:text-white min-w-[55px] text-right rtl:text-left">
                {formatMoney(item.price * item.qty, $config.currency)}
              </div>

              <!-- Remove -->
              <button
                on:click={() => removeItem(idx)}
                class="p-1 text-slate-400 hover:text-red-500"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Totals & Discounts -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
        <div class="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t('quotes_subtotal', $lang)}</span>
          <span class="text-slate-900 dark:text-white font-medium">{formatMoney(subtotal, $config.currency)}</span>
        </div>

        <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>{t('quotes_discount', $lang)} ({$config.currency}):</span>
          <input
            type="number"
            bind:value={discount}
            class="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-right rtl:text-left text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div class="flex justify-between text-sm font-bold text-sky-600 dark:text-sky-400 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <span>{t('quotes_total', $lang)}</span>
          <span>{formatMoney(total, $config.currency)}</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Big Compile Action Button -->
  {#if selectedItems.length > 0}
    <button
      on:click={handleCompile}
      disabled={$isLoading}
      class="touch-press w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
    >
      <svg class="w-5 h-5 {$isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
      <span>{$isLoading ? t('quotes_compiling', $lang) : t('quotes_compile_btn', $lang)}</span>
    </button>
  {/if}

  <!-- Ready-Made Price Library (Tap to Add) -->
  {#if catalog.length > 0}
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">{t('quotes_catalog_title', $lang)}</h3>
        <span class="text-[11px] text-slate-500">{t('quotes_tap_hint', $lang)}</span>
      </div>

      <div class="space-y-2">
        {#each catalog as srv}
          <button
            type="button"
            on:click={() => addItem(srv)}
            class="touch-press w-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 text-left rtl:text-right flex items-center justify-between transition-colors group"
          >
            <div class="flex-1 pr-3 rtl:pr-0 rtl:pl-3">
              <div class="flex items-center space-x-2 rtl:space-x-reverse">
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500">{srv.name}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{srv.category}</span>
              </div>
              {#if srv.description}
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{srv.description}</div>
              {/if}
            </div>

            <div class="text-right rtl:text-left">
              <div class="text-xs font-bold text-sky-600 dark:text-sky-400">{formatMoney(srv.price, $config.currency)}</div>
              <div class="text-[10px] text-slate-400 dark:text-slate-500">{srv.unit || 'unit'}</div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Previous Quotes History -->
  {#if ($quotes || []).length > 0}
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
      <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">{t('quotes_issued_title', $lang)} ({$quotes.length})</h3>
      <div class="space-y-2">
        {#each $quotes.slice(0, 5) as q}
          <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <div class="font-bold text-slate-900 dark:text-white">{q.clientName}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">{q.quoteNumber} • {formatMoney(q.total, q.currency || $config.currency)}</div>
            </div>
            {#if q.pdfUrl}
              <a
                href={q.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="touch-press px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 font-semibold text-xs flex items-center space-x-1 rtl:space-x-reverse"
              >
                <span>{t('quotes_view_pdf', $lang)}</span>
              </a>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
