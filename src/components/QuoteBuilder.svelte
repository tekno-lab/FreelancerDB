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

<div class="space-y-4 pb-24">
  <!-- Heading & Reset -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('quotes_title', $lang)}</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('quotes_subtitle', $lang)}</p>
    </div>
    {#if selectedItems.length > 0 || generatedPdfUrl}
      <button
        type="button"
        on:click={resetBuilder}
        class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
      >
        {t('quotes_clear', $lang)}
      </button>
    {/if}
  </div>

  <!-- Success Notification Card when PDF is compiled -->
  {#if generatedPdfUrl}
    <div class="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/70 dark:to-slate-900 border border-sky-400/40 rounded-3xl p-5 shadow-lg text-sm transition-all">
      <div class="flex items-center space-x-2 rtl:space-x-reverse text-sky-600 dark:text-sky-400 font-bold mb-1">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-base">{t('quotes_pdf_compiled', $lang)}</span>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 mb-3.5">
        Ref: <strong class="text-slate-900 dark:text-white">{lastQuoteNumber}</strong> • {t('quotes_saved_in', $lang)}
      </p>

      <div class="flex items-center space-x-2 rtl:space-x-reverse">
        <a
          href={generatedPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="touch-press flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs text-center flex items-center justify-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-sky-600/30"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{t('quotes_open_pdf', $lang)}</span>
        </a>

        <button
          type="button"
          on:click={() => {
            navigator.clipboard.writeText(generatedPdfUrl);
            alert($lang === 'ku' ? 'بەستەری فایلی PDF کۆپی کرا!' : 'PDF Google Drive link copied to clipboard!');
          }}
          class="touch-press min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center justify-center"
          title={t('quotes_copy_link', $lang)}
          aria-label={t('quotes_copy_link', $lang)}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <!-- Client Details Section -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-sm">
    <div class="flex items-center space-x-2 rtl:space-x-reverse text-slate-400 dark:text-slate-500">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">{t('quotes_client_info', $lang)}</h3>
    </div>

    <div class="space-y-3 text-xs">
      <div>
        <label for="quote-client-name" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('quotes_client_name', $lang)}</label>
        <input
          id="quote-client-name"
          type="text"
          bind:value={clientName}
          placeholder="e.g. Al-Basha Trading Co."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-xs sm:text-sm font-medium"
        />
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label for="quote-client-email" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('quotes_email', $lang)}</label>
          <input
            id="quote-client-email"
            type="email"
            bind:value={clientEmail}
            placeholder="client@company.com"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-xs"
            dir="ltr"
          />
        </div>
        <div>
          <label for="quote-client-phone" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('quotes_phone', $lang)}</label>
          <input
            id="quote-client-phone"
            type="tel"
            bind:value={clientPhone}
            placeholder="+964..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-xs"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Selected Line Items Section -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2 rtl:space-x-reverse text-slate-400 dark:text-slate-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
          {t('quotes_items', $lang)} ({selectedItems.length})
        </h3>
      </div>
      {#if selectedItems.length > 0}
        <span class="text-xs font-black text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
          {formatMoney(total, $config.currency)}
        </span>
      {/if}
    </div>

    {#if selectedItems.length === 0}
      <div class="text-center py-7 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
        <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('quotes_no_items', $lang)}</p>
        <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">{t('quotes_no_items_hint', $lang)}</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each selectedItems as item, idx}
          <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-2.5">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-extrabold text-slate-900 dark:text-white truncate">{item.name}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {formatMoney(item.price, $config.currency)}
              </div>
            </div>

            <!-- Stepper Controls (Min 36px touch size) -->
            <div class="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">
              <div class="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  on:click={() => changeQty(idx, -1)}
                  class="touch-press min-h-[34px] min-w-[34px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Decrease quantity"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
                  </svg>
                </button>
                <span class="px-2 text-xs font-black text-slate-900 dark:text-white min-w-[24px] text-center">{item.qty}</span>
                <button
                  type="button"
                  on:click={() => changeQty(idx, 1)}
                  class="touch-press min-h-[34px] min-w-[34px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Increase quantity"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <!-- Line Total -->
              <div class="text-xs font-black text-slate-900 dark:text-white min-w-[60px] text-right rtl:text-left">
                {formatMoney(item.price * item.qty, $config.currency)}
              </div>

              <!-- Remove -->
              <button
                type="button"
                on:click={() => removeItem(idx)}
                class="touch-press min-h-[34px] min-w-[34px] flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                aria-label="Remove item"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Financial Calculations Breakdown -->
      <div class="pt-3.5 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
        <div class="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
          <span>{t('quotes_subtotal', $lang)}</span>
          <span class="text-slate-900 dark:text-white font-bold">{formatMoney(subtotal, $config.currency)}</span>
        </div>

        <div class="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
          <label for="quote-discount-input">{t('quotes_discount', $lang)} ({$config.currency}):</label>
          <input
            id="quote-discount-input"
            type="number"
            bind:value={discount}
            class="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-right rtl:text-left text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div class="flex justify-between text-base font-black text-sky-600 dark:text-sky-400 pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
          <span>{t('quotes_total', $lang)}</span>
          <span>{formatMoney(total, $config.currency)}</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Compile Action Button -->
  {#if selectedItems.length > 0}
    <button
      type="button"
      on:click={handleCompile}
      disabled={$isLoading}
      class="touch-press w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 transition-all"
    >
      <svg class="w-5 h-5 {$isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
      <span>{$isLoading ? t('quotes_compiling', $lang) : t('quotes_compile_btn', $lang)}</span>
    </button>
  {/if}

  <!-- Ready-Made Price Library (Tap to Add) -->
  {#if catalog.length > 0}
    <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 space-y-3 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 rtl:space-x-reverse text-slate-400 dark:text-slate-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">{t('quotes_catalog_title', $lang)}</h3>
        </div>
        <span class="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">{t('quotes_tap_hint', $lang)}</span>
      </div>

      <div class="space-y-2">
        {#each catalog as srv}
          <button
            type="button"
            on:click={() => addItem(srv)}
            class="touch-press w-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 text-left rtl:text-right flex items-center justify-between transition-all group active:scale-[0.99]"
          >
            <div class="flex-1 pr-3 rtl:pr-0 rtl:pl-3 min-w-0">
              <div class="flex items-center space-x-2 rtl:space-x-reverse">
                <span class="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors truncate">{srv.name}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">{srv.category}</span>
              </div>
              {#if srv.description}
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{srv.description}</div>
              {/if}
            </div>

            <div class="text-right rtl:text-left flex-shrink-0">
              <div class="text-xs font-black text-sky-600 dark:text-sky-400">{formatMoney(srv.price, $config.currency)}</div>
              <div class="text-[10px] text-slate-400 font-medium">{srv.unit || 'unit'}</div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Previous Quotes History -->
  {#if ($quotes || []).length > 0}
    <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 space-y-3 shadow-sm">
      <h3 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">{t('quotes_issued_title', $lang)} ({$quotes.length})</h3>
      <div class="space-y-2">
        {#each $quotes.slice(0, 5) as q}
          <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div class="min-w-0 flex-1 pr-2 rtl:pr-0 rtl:pl-2">
              <div class="font-extrabold text-slate-900 dark:text-white truncate">{q.clientName}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{q.quoteNumber} • {formatMoney(q.total, q.currency || $config.currency)}</div>
            </div>
            {#if q.pdfUrl}
              <a
                href={q.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="touch-press min-h-[36px] px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 font-bold text-xs flex items-center space-x-1 rtl:space-x-reverse hover:bg-sky-100 flex-shrink-0"
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
