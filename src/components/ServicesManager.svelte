<script>
  import { config, services, isLoading } from '../lib/stores.js';
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

  const categories = ['All', 'Web Development', 'QR Codes', 'Database', 'Business Systems', 'Branding'];

  $: filtered = selectedCategory === 'All'
    ? ($services || [])
    : ($services || []).filter(s => s.category === selectedCategory);

  function startAdd() {
    triggerHaptic();
    editingId = null;
    name = '';
    category = selectedCategory !== 'All' ? selectedCategory : 'Web Development';
    price = 100;
    unit = 'per year';
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
      alert('Please enter service name.');
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
    if (confirm(`Remove "${s.name}" from catalog?`)) {
      await apiDeleteService(s.id);
    }
  }
</script>

<div class="space-y-4 pb-nav">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Services & Pricing Library</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400">Standard rates for quote generation</p>
    </div>
    <button
      on:click={startAdd}
      class="touch-press px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold text-xs shadow-md shadow-sky-600/30 flex items-center space-x-1"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span>Add Service</span>
    </button>
  </div>

  <!-- Category Pills Filter -->
  <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
    {#each categories as cat}
      <button
        on:click={() => { triggerHaptic(); selectedCategory = cat; }}
        class="touch-press px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all {selectedCategory === cat ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}"
      >
        {cat}
      </button>
    {/each}
  </div>

  <!-- Service Items List -->
  {#if filtered.length === 0}
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
      <div class="w-12 h-12 rounded-full bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">No services added yet</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">Click "Add Service" above or sync your services from your Google Sheet.</p>
    </div>
  {:else}
    <div class="space-y-2.5">
      {#each filtered as srv}
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-sm">
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-slate-900 dark:text-white">{srv.name}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">{srv.category}</span>
            </div>
            {#if srv.description}
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{srv.description}</p>
            {/if}
            <div class="mt-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
              {formatMoney(srv.price, $config.currency)} <span class="text-[11px] text-slate-400 dark:text-slate-500 font-normal">/ {srv.unit || 'unit'}</span>
            </div>
          </div>

          <div class="flex items-center space-x-1">
            <button
              on:click={() => startEdit(srv)}
              class="touch-press p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              on:click={() => handleDelete(srv)}
              class="touch-press p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500"
              title="Delete"
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
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Service' : 'New Service'}</h3>
          <button on:click={() => isEditing = false} class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-600 dark:text-slate-400 mb-1">Service Title *</label>
            <input
              type="text"
              bind:value={name}
              placeholder="e.g. Manager.io Cloud Hosting"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
              <select
                bind:value={category}
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="QR Codes">QR Codes</option>
                <option value="Database">Database (Manager.io)</option>
                <option value="Business Systems">Business Systems</option>
                <option value="Branding">Branding</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-600 dark:text-slate-400 mb-1">Default Rate ({$config.currency})</label>
              <input
                type="number"
                step="any"
                bind:value={price}
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-600 dark:text-slate-400 mb-1">Billing Unit</label>
            <input
              type="text"
              bind:value={unit}
              placeholder="e.g. per year, one-time, per month"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label class="block text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea
              rows="2"
              bind:value={description}
              placeholder="What is included in this service package..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            ></textarea>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            on:click={handleSave}
            class="touch-press w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold text-xs shadow-md"
          >
            Save Service
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
