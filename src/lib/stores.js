import { writable, derived } from 'svelte/store';
import { daysUntil } from './utils.js';

// Clean initial empty state (no mockup data)
const INITIAL_RENEWALS = [];
const INITIAL_SERVICES = [];

// Helper to create localStorage-synced store
function createLocalStore(key, fallback, cleanFilter = null) {
  let initial = fallback;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        let parsed = JSON.parse(stored);
        if (cleanFilter && Array.isArray(parsed)) {
          parsed = cleanFilter(parsed);
          localStorage.setItem(key, JSON.stringify(parsed));
        }
        initial = parsed;
      }
    } catch (e) {}
  }
  const store = writable(initial);
  store.subscribe((val) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {}
    }
  });
  return store;
}

// Clean any old demo mockup entries from user's cache
function removeDemoRenewals(list) {
  return list.filter(r => !r.id || !r.id.startsWith('ren-demo'));
}

export const config = createLocalStore('tl_config', {
  webAppUrl: '',
  apiKey: '',
  currency: 'USD',
  calendarReminderDays: 7
});

export const renewals = createLocalStore('tl_renewals', INITIAL_RENEWALS, removeDemoRenewals);
export const services = createLocalStore('tl_services', INITIAL_SERVICES);
export const quotes = createLocalStore('tl_quotes', []);

// Theme Store (Dark / Light Mode)
function createThemeStore() {
  let initial = 'dark';
  if (typeof window !== 'undefined') {
    initial = localStorage.getItem('tl_theme') || 'dark';
    applyThemeClass(initial);
  }
  const store = writable(initial);
  return {
    subscribe: store.subscribe,
    set: (mode) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tl_theme', mode);
        applyThemeClass(mode);
      }
      store.set(mode);
    },
    toggle: () => {
      store.update((cur) => {
        const next = cur === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem('tl_theme', next);
          applyThemeClass(next);
        }
        return next;
      });
    }
  };
}

function applyThemeClass(mode) {
  if (typeof document !== 'undefined') {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }
}

export const theme = createThemeStore();

export const activeTab = writable('renewals'); // 'renewals' | 'quotes' | 'services' | 'alerts' | 'settings'
export const isLoading = writable(false);
export const isOnline = writable(typeof navigator !== 'undefined' ? navigator.onLine : true);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => isOnline.set(true));
  window.addEventListener('offline', () => isOnline.set(false));
}

// Toast Notification Store
export const toast = writable({ visible: false, message: '', type: 'info' });
let toastTimeout;
export function showToast(message, type = 'info') {
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.set({ visible: true, message, type });
  toastTimeout = setTimeout(() => {
    toast.set({ visible: false, message: '', type: 'info' });
  }, 3500);
}

// Derived store for urgent renewal alerts (< 14 days)
export const urgentRenewals = derived(renewals, ($renewals) => {
  return ($renewals || [])
    .map(r => ({ ...r, daysLeft: daysUntil(r.expiryDate) }))
    .filter(r => r.daysLeft <= 14 && r.status !== 'Renewed')
    .sort((a, b) => a.daysLeft - b.daysLeft);
});

export const alertCount = derived(urgentRenewals, ($urgent) => $urgent.length);
