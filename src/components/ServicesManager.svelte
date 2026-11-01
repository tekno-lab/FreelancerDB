<script>
  import { config, services, isLoading } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { apiSaveService, apiDeleteService } from '../lib/api.js';
  import { formatMoney, triggerHaptic } from '../lib/utils.js';

  let selectedCategory = 'All';
  let isEditing = false;
  let editingId = null;

  let name = '';
  let category = 'Web Development';
  let price = 100;
  let unit = 'per year';
  let description = '';

  $: categories = [
    { id: 'All', label: t('filter_all', $lang) },
    { id: 'Web Development', label: $lang === 'ku' ? 'وێبسایت' : 'Web Development' },
    { id: 'QR Codes', label: $lang === 'ku' ? 'کۆدی QR' : 'QR Codes' },
    { id: 'Database', label: $lang === 'ku' ? 'داتابەیس' : 'Database' },
    { id: 'Business Systems', label: $lang === 'ku' ? 'سیستەمەکان' : 'Business Systems' },
    { id: 'Branding', label: $lang === 'ku' ? 'براندینگ' : 'Branding' }
  ];

  $: filtered = selectedCategory === 'All'
    ? ($services || [])
    : ($services || []).filter(s => s.category === selectedCategory);

  function startAdd() {
    triggerHaptic();
    editingId = null;
    name = '';
    category = selectedCategory !== 'All' ? selectedCategory : 'Web Development';
    price = 100;
    unit = $lang === 'ku' ? 'ساڵانە' : 'per year';
    description = '';
    isEditing = true;
  }

  function startEdit(s) {
    triggerHaptic();
    editingId = s.id;
    name = s.name;
    category = s.category;
    price = s.price;
    unit = s.unit || 'per year';
    description = s.description || '';
    isEditing = true;
  }

  async function handleSave() {
    triggerHaptic();
    if (!name.trim()) {
      alert($lang === 'ku' ? 'تکایە ناوی خزمەتگوزاری بنووسە.' : 'Please enter service name.');
      return;
    }

    await apiSaveService({
      id: editingId,
      name: name.trim(),
      category,
      price: Number(price) || 0,
      unit: unit.trim(),
      description: description.trim(),
      active: true
    });

    isEditing = false;
  }

  async function handleDelete(s) {
    triggerHaptic();
    const msg = `${t('confirm_delete', $lang)} "${s.name}"?`;
    if (confirm(msg)) {
      await apiDeleteService(s.id);
    }
  }
</script>

<div class="space-y-4 pb-24">
  <!-- Header with Add Action -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('srv_title', $lang)}</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('srv_subtitle', $lang)}</p>
    </div>
    <button
      type="button"
      on:click={startAdd}
      class="touch-press min-h-[40px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center space-x-1.5 rtl:space-x-reverse transition-all"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
      </svg>
      <span>{t('srv_add_btn', $lang)}</span>
    </button>
  </div>

  <!-- Category Pills Filter -->
  <div class="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1 text-xs scrollbar-none">
    {#each categories as cat}
      <button
        type="button"
        on:click={() => { triggerHaptic(); selectedCategory = cat.id; }}
        class="touch-press px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all {selectedCategory === cat.id ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/90 dark:border-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-850'}"
      >
        {cat.label}
      </button>
    {/each}
  </div>

  <!-- Service Items List -->
  {#if filtered.length === 0}
    <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 text-center shadow-sm">
      <div class="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center mb-3.5">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <p class="text-sm font-bold text-slate-800 dark:text-slate-200">{t('srv_empty_title', $lang)}</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">{t('srv_empty_desc', $lang)}</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each filtered as srv}
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-sm hover:shadow transition-all">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
              <span class="text-sm font-black text-slate-900 dark:text-white truncate">{srv.name}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
                {srv.category}
              </span>
            </div>
            {#if srv.description}
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{srv.description}</p>
            {/if}
            <div class="mt-2 text-xs font-black text-sky-600 dark:text-sky-400">
              {formatMoney(srv.price, $config.currency)} <span class="text-[11px] text-slate-400 font-medium">/ {srv.unit || 'unit'}</span>
            </div>
          </div>

          <!-- Thumb Controls (Min 38px touch size) -->
          <div class="flex items-center space-x-1.5 rtl:space-x-reverse flex-shrink-0">
            <button
              type="button"
              on:click={() => startEdit(srv)}
              class="touch-press min-h-[38px] min-w-[38px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center transition-all"
              title={t('card_edit', $lang)}
              aria-label={t('card_edit', $lang)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={() => handleDelete(srv)}
              class="touch-press min-h-[38px] min-w-[38px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 flex items-center justify-center transition-all"
              title={t('card_delete', $lang)}
              aria-label={t('card_delete', $lang)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Modal for Adding / Editing Service -->
  {#if isEditing}
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{editingId ? t('srv_modal_edit', $lang) : t('srv_modal_new', $lang)}</h3>
          <button type="button" on:click={() => isEditing = false} class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-3.5 text-xs">
          <div>
            <label for="srv-name-input" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('srv_name', $lang)}</label>
            <input
              id="srv-name-input"
              type="text"
              bind:value={name}
              placeholder="e.g. Manager.io Cloud Hosting"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label for="srv-cat-select" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('srv_category', $lang)}</label>
              <select
                id="srv-cat-select"
                bind:value={category}
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Web Development">{$lang === 'ku' ? 'وێبسایت' : 'Web Development'}</option>
                <option value="QR Codes">{$lang === 'ku' ? 'کۆدی QR' : 'QR Codes'}</option>
                <option value="Database">{$lang === 'ku' ? 'داتابەیس' : 'Database'}</option>
                <option value="Business Systems">{$lang === 'ku' ? 'سیستەمەکان' : 'Business Systems'}</option>
                <option value="Branding">{$lang === 'ku' ? 'براندینگ' : 'Branding'}</option>
              </select>
            </div>

            <div>
              <label for="srv-rate-input" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('srv_rate', $lang)} ({$config.currency})</label>
              <input
                id="srv-rate-input"
                type="number"
                step="any"
                bind:value={price}
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label for="srv-unit-input" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('srv_unit', $lang)}</label>
            <input
              id="srv-unit-input"
              type="text"
              bind:value={unit}
              placeholder="e.g. per year, one-time, per month"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label for="srv-desc-input" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('srv_desc', $lang)}</label>
            <textarea
              id="srv-desc-input"
              rows="2"
              bind:value={description}
              placeholder="What is included in this service package..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            ></textarea>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            on:click={handleSave}
            class="touch-press w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center transition-all"
          >
            {t('srv_save', $lang)}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
