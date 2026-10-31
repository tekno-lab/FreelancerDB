import { get } from 'svelte/store';
import { config, renewals, services, quotes, isLoading, showToast } from './stores.js';

// Send command to Google Apps Script Web App
export async function callBackend(action, payload = {}) {
  const cfg = get(config);
  if (!cfg.webAppUrl) {
    throw new Error('Google Apps Script Web App URL not configured. Go to Settings tab.');
  }

  const bodyData = {
    key: cfg.apiKey || '',
    action: action,
    ...payload
  };

  try {
    const res = await fetch(cfg.webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain prevents CORS preflight issues with GAS
      body: JSON.stringify(bodyData),
      redirect: 'follow'
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || 'Request rejected by Google Apps Script backend.');
    }

    return data;
  } catch (err) {
    console.error('GAS API Error:', err);
    throw err;
  }
}

// Sync full state from Google Sheets
export async function syncState() {
  const cfg = get(config);
  if (!cfg.webAppUrl) {
    showToast('Operating in local offline mode. Add Web App URL in Settings to sync.', 'info');
    return;
  }

  isLoading.set(true);
  try {
    const data = await callBackend('state');
    if (data.renewals) renewals.set(data.renewals);
    if (data.services) services.set(data.services);
    if (data.quotes) quotes.set(data.quotes);
    if (data.currency) {
      config.update(c => ({ ...c, currency: data.currency }));
    }
    showToast('Database synced with Google Sheets!', 'success');
  } catch (err) {
    showToast(`Sync failed: ${err.message}`, 'error');
  } finally {
    isLoading.set(false);
  }
}

// Upsert a Renewal (Websites, QR Codes, Manager.io Databases)
export async function apiSaveRenewal(item, syncCalendar = true) {
  isLoading.set(true);
  const cfg = get(config);
  const id = item.id || ('ren-' + Math.random().toString(36).slice(2, 9));
  const fullItem = { ...item, id };

  // Optimistic local update
  renewals.update(list => {
    const idx = list.findIndex(r => r.id === id);
    if (idx >= 0) {
      list[idx] = fullItem;
      return [...list];
    }
    return [fullItem, ...list];
  });

  if (cfg.webAppUrl) {
    try {
      const res = await callBackend('saveRenewal', { ...fullItem, syncCalendar });
      if (res.calendarEventId) {
        renewals.update(list => list.map(r => r.id === id ? { ...r, calendarEventId: res.calendarEventId } : r));
      }
      showToast('Renewal saved & Google Calendar synced (7-day alert)!', 'success');
    } catch (err) {
      showToast(`Saved locally. (Backend sync error: ${err.message})`, 'warning');
    }
  } else {
    showToast('Renewal saved locally!', 'success');
  }
  isLoading.set(false);
}

// Delete a Renewal
export async function apiDeleteRenewal(id) {
  isLoading.set(true);
  const cfg = get(config);

  // Local update
  renewals.update(list => list.filter(r => r.id !== id));

  if (cfg.webAppUrl) {
    try {
      await callBackend('deleteRenewal', { id });
      showToast('Renewal and Calendar event deleted.', 'success');
    } catch (err) {
      showToast(`Deleted locally. (Backend notice: ${err.message})`, 'warning');
    }
  } else {
    showToast('Renewal deleted locally.', 'info');
  }
  isLoading.set(false);
}

// Save Service Item
export async function apiSaveService(serviceItem) {
  isLoading.set(true);
  const cfg = get(config);
  const id = serviceItem.id || ('srv-' + Math.random().toString(36).slice(2, 9));
  const fullItem = { ...serviceItem, id };

  services.update(list => {
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx] = fullItem;
      return [...list];
    }
    return [...list, fullItem];
  });

  if (cfg.webAppUrl) {
    try {
      await callBackend('saveService', fullItem);
      showToast('Service saved to catalog.', 'success');
    } catch (err) {
      showToast(`Saved locally. (Sync: ${err.message})`, 'warning');
    }
  } else {
    showToast('Service saved locally.', 'success');
  }
  isLoading.set(false);
}

// Delete Service Item
export async function apiDeleteService(id) {
  isLoading.set(true);
  const cfg = get(config);

  services.update(list => list.filter(s => s.id !== id));

  if (cfg.webAppUrl) {
    try {
      await callBackend('deleteService', { id });
      showToast('Service removed from catalog.', 'success');
    } catch (err) {
      showToast(`Deleted locally. (Sync: ${err.message})`, 'warning');
    }
  } else {
    showToast('Service removed locally.', 'info');
  }
  isLoading.set(false);
}

// Generate Quote and Compile PDF to Google Drive
export async function apiGenerateQuote(quoteData) {
  isLoading.set(true);
  const cfg = get(config);
  const id = quoteData.id || ('quo-' + Math.random().toString(36).slice(2, 9));
  const quoteNumber = quoteData.quoteNumber || ('TL-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase());

  const newQuote = {
    ...quoteData,
    id,
    quoteNumber,
    createdAt: new Date().toISOString(),
    status: 'Issued'
  };

  let pdfUrl = '';

  if (cfg.webAppUrl) {
    try {
      const res = await callBackend('generateQuote', newQuote);
      pdfUrl = res.pdfUrl;
      newQuote.pdfUrl = pdfUrl;
      quotes.update(list => [newQuote, ...list]);
      showToast('Quotation PDF generated & saved in Google Drive!', 'success');
      isLoading.set(false);
      return { ok: true, pdfUrl, quoteNumber };
    } catch (err) {
      quotes.update(list => [newQuote, ...list]);
      showToast(`Quote recorded locally. (PDF compile error: ${err.message})`, 'warning');
      isLoading.set(false);
      return { ok: true, pdfUrl: '', quoteNumber };
    }
  } else {
    quotes.update(list => [newQuote, ...list]);
    showToast('Quote saved locally. Connect Google Apps Script to enable Drive PDF compiling.', 'info');
    isLoading.set(false);
    return { ok: true, pdfUrl: '', quoteNumber };
  }
}
