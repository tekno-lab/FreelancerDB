<script>
  import { config, renewals, services, quotes, theme, showToast, isLoading } from '../lib/stores.js';
  import { lang, t } from '../lib/i18n.js';
  import { callBackend, syncState } from '../lib/api.js';
  import { triggerHaptic } from '../lib/utils.js';

  let webAppUrl = $config.webAppUrl || '';
  let apiKey = $config.apiKey || '';
  let currency = $config.currency || 'USD';
  let testStatus = '';

  function saveSettings() {
    triggerHaptic();
    config.set({
      webAppUrl: webAppUrl.trim(),
      apiKey: apiKey.trim(),
      currency,
      calendarReminderDays: 7
    });
    showToast($lang === 'ku' ? 'ڕێکخستنەکان پاشەکەوت کران!' : 'Settings saved successfully!', 'success');
  }

  async function testConnection() {
    triggerHaptic();
    saveSettings();
    if (!webAppUrl.trim()) {
      testStatus = $lang === 'ku' ? 'تکایە بەستەری Web App بنووسە.' : 'Please enter a Google Apps Script Web App URL.';
      return;
    }
    testStatus = $lang === 'ku' ? 'لە پەیوەندیکردندایە لەگەڵ شیت...' : 'Testing connection to Google Sheets...';
    try {
      const res = await callBackend('state');
      testStatus = $lang === 'ku'
        ? `پەیوەندی بەسترا! وەشانی ${res.version || '1.0'}. ${res.renewals?.length || 0} نوێکردنەوە دۆزرایەوە.`
        : `Connected! Backend v${res.version || '1.0'} ready. Found ${res.renewals?.length || 0} renewals in sheet.`;
      showToast($lang === 'ku' ? 'پەیوەندی بەسترا!' : 'Connection verified successfully!', 'success');
      syncState();
    } catch (err) {
      testStatus = `${$lang === 'ku' ? 'شکستی هێنا' : 'Connection failed'}: ${err.message}`;
      showToast(testStatus, 'error');
    }
  }

  function handleThemeChange(mode) {
    triggerHaptic();
    theme.set(mode);
  }

  function handleLangChange(l) {
    triggerHaptic();
    lang.set(l);
  }

  function clearCache() {
    triggerHaptic();
    const msg = $lang === 'ku'
      ? 'ئایا دڵنیایت لە سڕینەوەی داتاکانی سەر مۆبایلەکەت؟'
      : 'Clear local cache? This will reset local data until next Google Sheets sync.';
    if (confirm(msg)) {
      renewals.set([]);
      services.set([]);
      quotes.set([]);
      localStorage.removeItem('tl_renewals');
      localStorage.removeItem('tl_services');
      localStorage.removeItem('tl_quotes');
      showToast($lang === 'ku' ? 'کاش سڕایەوە!' : 'Local cache cleared!', 'info');
    }
  }

  function exportBackup() {
    triggerHaptic();
    const data = {
      config: $config,
      renewals: $renewals,
      services: $services,
      quotes: $quotes,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TeknoLabs_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast($lang === 'ku' ? 'پاڵپشت دابەزی!' : 'Backup JSON downloaded!', 'success');
  }
</script>

<div class="space-y-4 pb-nav">
  <div>
    <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('settings_title', $lang)}</h2>
    <p class="text-xs text-slate-500 dark:text-slate-400">{t('settings_subtitle', $lang)}</p>
  </div>

  <!-- Language Selection Card -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
    <div class="flex items-center space-x-2">
      <div class="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </div>
      <div>
        <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('settings_lang_title', $lang)}</h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">{t('settings_lang_desc', $lang)}</p>
      </div>
    </div>

    <!-- Language Buttons -->
    <div class="grid grid-cols-2 gap-2 text-xs">
      <button
        type="button"
        on:click={() => handleLangChange('en')}
        class="touch-press py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 font-semibold transition-all {$lang === 'en' ? 'bg-sky-600/20 border-sky-500 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}"
      >
        <span>English</span>
      </button>

      <button
        type="button"
        on:click={() => handleLangChange('ku')}
        class="touch-press py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 font-semibold transition-all {$lang === 'ku' ? 'bg-sky-600/20 border-sky-500 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}"
      >
        <span>کوردی (سۆرانی)</span>
      </button>
    </div>
  </div>

  <!-- Appearance / Dark Mode Card -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
    <div class="flex items-center space-x-2">
      <div class="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
      <div>
        <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('settings_theme_title', $lang)}</h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">{t('settings_theme_desc', $lang)}</p>
      </div>
    </div>

    <!-- Toggle Buttons -->
    <div class="grid grid-cols-2 gap-2 text-xs">
      <button
        type="button"
        on:click={() => handleThemeChange('dark')}
        class="touch-press py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 font-semibold transition-all {$theme === 'dark' ? 'bg-sky-600/20 border-sky-500 text-sky-400 ring-1 ring-sky-500' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <span>{t('settings_dark', $lang)}</span>
      </button>

      <button
        type="button"
        on:click={() => handleThemeChange('light')}
        class="touch-press py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 font-semibold transition-all {$theme === 'light' ? 'bg-sky-600/20 border-sky-500 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>{t('settings_light', $lang)}</span>
      </button>
    </div>
  </div>

  <!-- Backend Connection Card -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
    <div class="flex items-center space-x-2">
      <div class="w-2.5 h-2.5 rounded-full {webAppUrl ? 'bg-emerald-400' : 'bg-amber-400'}"></div>
      <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('settings_gateway_title', $lang)}</h3>
    </div>

    <div class="space-y-3 text-xs">
      <div>
        <label class="block text-slate-700 dark:text-slate-300 font-medium mb-1">{t('settings_url', $lang)}</label>
        <input
          type="url"
          bind:value={webAppUrl}
          placeholder="https://script.google.com/macros/s/.../exec"
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-sky-500"
          dir="ltr"
        />
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t('settings_url_hint', $lang)}</p>
      </div>

      <div>
        <label class="block text-slate-700 dark:text-slate-300 font-medium mb-1">{t('settings_key', $lang)}</label>
        <input
          type="password"
          bind:value={apiKey}
          placeholder="Private secret key from Setup tab"
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-sky-500"
          dir="ltr"
        />
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t('settings_key_hint', $lang)}</p>
      </div>

      <div>
        <label class="block text-slate-700 dark:text-slate-300 font-medium mb-1">{t('settings_currency', $lang)}</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            on:click={() => { triggerHaptic(); currency = 'USD'; }}
            class="touch-press py-2 rounded-xl border text-xs font-semibold {currency === 'USD' ? 'bg-sky-600/20 border-sky-500 text-sky-600 dark:text-sky-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}"
          >
            USD ($)
          </button>
          <button
            type="button"
            on:click={() => { triggerHaptic(); currency = 'IQD'; }}
            class="touch-press py-2 rounded-xl border text-xs font-semibold {currency === 'IQD' ? 'bg-sky-600/20 border-sky-500 text-sky-600 dark:text-sky-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}"
          >
            Iraqi Dinar (IQD)
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="pt-2 flex items-center space-x-2">
      <button
        on:click={testConnection}
        disabled={$isLoading}
        class="touch-press flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center space-x-1.5"
      >
        <svg class="w-4 h-4 {$isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>{t('settings_test_btn', $lang)}</span>
      </button>

      <button
        on:click={saveSettings}
        class="touch-press py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 font-semibold text-xs"
      >
        {t('settings_save_btn', $lang)}
      </button>
    </div>

    {#if testStatus}
      <div class="p-2.5 rounded-xl text-[11px] {testStatus.includes('!') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'}">
        {testStatus}
      </div>
    {/if}
  </div>

  <!-- PWA Installation Guide -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 text-xs shadow-sm">
    <h3 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t('settings_pwa_title', $lang)}</h3>
    <ul class="text-slate-600 dark:text-slate-400 space-y-1.5 text-[11px] list-disc list-inside">
      <li>{t('settings_pwa_ios', $lang)}</li>
      <li>{t('settings_pwa_android', $lang)}</li>
    </ul>
  </div>

  <!-- Data Backup & Clear Cache -->
  <div class="grid grid-cols-2 gap-2">
    <button
      on:click={exportBackup}
      class="touch-press py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center space-x-1 shadow-sm"
    >
      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>{t('settings_export', $lang)}</span>
    </button>

    <button
      on:click={clearCache}
      class="touch-press py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center space-x-1 shadow-sm"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span>{t('settings_clear_cache', $lang)}</span>
    </button>
  </div>
</div>
