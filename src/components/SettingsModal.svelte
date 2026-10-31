<script>
  import { config, renewals, services, quotes, showToast, isLoading } from '../lib/stores.js';
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
    showToast('Settings saved successfully!', 'success');
  }

  async function testConnection() {
    triggerHaptic();
    saveSettings();
    if (!webAppUrl.trim()) {
      testStatus = 'Please enter a Google Apps Script Web App URL.';
      return;
    }
    testStatus = 'Testing connection to Google Sheets...';
    try {
      const res = await callBackend('state');
      testStatus = `Connected! Backend v${res.version || '1.0'} ready. Found ${res.renewals?.length || 0} renewals in sheet.`;
      showToast('Connection verified successfully!', 'success');
      syncState();
    } catch (err) {
      testStatus = `Connection failed: ${err.message}`;
      showToast(`Connection failed: ${err.message}`, 'error');
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
    showToast('Backup JSON downloaded!', 'success');
  }
</script>

<div class="space-y-4 pb-nav">
  <div>
    <h2 class="text-lg font-bold text-white tracking-tight">System Settings & Connection</h2>
    <p class="text-xs text-slate-400">Configure your Google Sheets API & Google Drive storage</p>
  </div>

  <!-- Backend Connection Card -->
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
    <div class="flex items-center space-x-2">
      <div class="w-2.5 h-2.5 rounded-full {webAppUrl ? 'bg-emerald-400' : 'bg-amber-400'}"></div>
      <h3 class="text-xs font-bold text-white uppercase tracking-wider">Google Apps Script Web App Gateway</h3>
    </div>

    <div class="space-y-3 text-xs">
      <div>
        <label class="block text-slate-300 font-medium mb-1">Web App Deployment URL</label>
        <input
          type="url"
          bind:value={webAppUrl}
          placeholder="https://script.google.com/macros/s/.../exec"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-sky-500"
        />
        <p class="text-[10px] text-slate-500 mt-1">Get this from: Google Sheets > Extensions > Apps Script > Deploy > Web App.</p>
      </div>

      <div>
        <label class="block text-slate-300 font-medium mb-1">Manager Access Key</label>
        <input
          type="password"
          bind:value={apiKey}
          placeholder="Private secret key from Setup tab"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
        />
        <p class="text-[10px] text-slate-500 mt-1">Found in cell B4 of your "Setup" tab in Google Sheets.</p>
      </div>

      <div>
        <label class="block text-slate-300 font-medium mb-1">Default Currency</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            on:click={() => { triggerHaptic(); currency = 'USD'; }}
            class="touch-press py-2 rounded-xl border text-xs font-semibold {currency === 'USD' ? 'bg-sky-600/20 border-sky-500 text-sky-400' : 'bg-slate-950 border-slate-800 text-slate-400'}"
          >
            USD ($)
          </button>
          <button
            type="button"
            on:click={() => { triggerHaptic(); currency = 'IQD'; }}
            class="touch-press py-2 rounded-xl border text-xs font-semibold {currency === 'IQD' ? 'bg-sky-600/20 border-sky-500 text-sky-400' : 'bg-slate-950 border-slate-800 text-slate-400'}"
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
        class="touch-press flex-1 py-2.5 px-3 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center space-x-1.5"
      >
        <svg class="w-4 h-4 {$isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Test Connection</span>
      </button>

      <button
        on:click={saveSettings}
        class="touch-press py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs"
      >
        Save
      </button>
    </div>

    {#if testStatus}
      <div class="p-2.5 rounded-xl text-[11px] {testStatus.startsWith('Connected') ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'}">
        {testStatus}
      </div>
    {/if}
  </div>

  <!-- PWA Installation Guide -->
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
    <h3 class="font-bold text-white uppercase tracking-wider text-[11px]">Install on Smartphone</h3>
    <ul class="text-slate-400 space-y-1.5 text-[11px] list-disc list-inside">
      <li><strong>iOS (iPhone Safari)</strong>: Tap the Share button &gt; Select "Add to Home Screen".</li>
      <li><strong>Android (Chrome)</strong>: Tap the three dots &gt; Select "Install app" or "Add to Home screen".</li>
      <li>Runs standalone without browser address bars, with offline cache support.</li>
    </ul>
  </div>

  <!-- Data Backup & Export -->
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
    <div>
      <div class="text-xs font-bold text-white">Local JSON Backup</div>
      <div class="text-[11px] text-slate-400">Download copy of cached data</div>
    </div>
    <button
      on:click={exportBackup}
      class="touch-press px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold"
    >
      Export JSON
    </button>
  </div>
</div>
