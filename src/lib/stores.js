import { writable, derived } from 'svelte/store';
import { daysUntil } from './utils.js';

// Real Business Renewals Dataset (Websites, Manager.io Databases, QR Codes)
const INITIAL_RENEWALS = [
  // 1. Websites & Business Systems
  {
    id: 'ren-bahar-web',
    client: 'Bahar Factory',
    item: 'baharfactory.com',
    type: 'Website',
    expiryDate: '2027-02-01',
    cycle: 'Annual',
    cost: 0,
    price: 500,
    commission: 0,
    link: 'https://baharfactory.com',
    provider: 'Web Hosting',
    status: 'Active',
    notes: 'Published: 2024-02-01 • Total Collected: $950'
  },
  {
    id: 'ren-gagromed',
    client: 'Gagromed',
    item: 'gagromed.com',
    type: 'Website',
    expiryDate: '2027-02-01',
    cycle: 'Annual',
    cost: 17.17,
    price: 300,
    commission: 25,
    link: 'https://gagromed.com',
    provider: 'Domain ($17.17 / 23,618 IQD)',
    status: 'Active',
    notes: '10% Commission for Kak Hiwa ($25) • Total Collected: $550'
  },
  {
    id: 'ren-mgr-bahar',
    client: 'Bahar Factory',
    item: 'Manager Bahar Factory',
    type: 'Database',
    expiryDate: '2027-02-01',
    cycle: 'Annual',
    cost: 0,
    price: 500,
    commission: 0,
    link: '',
    provider: 'Manager.io Cloud',
    status: 'Active',
    notes: 'Published: 2025-02-01 • Total Collected: $500'
  },
  {
    id: 'ren-mgr-hajisaman',
    client: 'Haji Saman Brusk Town',
    item: 'Manager Haji Saman Brusk Town',
    type: 'Database',
    expiryDate: '2027-02-01',
    cycle: 'Annual',
    cost: 0,
    price: 400,
    commission: 0,
    link: '',
    provider: 'Manager.io Cloud',
    status: 'Active',
    notes: 'Published: 2025-02-01 • Total Collected: $400'
  },
  {
    id: 'ren-icla',
    client: 'ICLA',
    item: 'ICLA System',
    type: 'Website',
    expiryDate: '2027-02-01',
    cycle: 'Annual',
    cost: 0,
    price: 100,
    commission: 0,
    link: '',
    provider: '',
    status: 'Inactive',
    notes: 'Published: 2026-02-01 • Total Collected: $100'
  },
  {
    id: 'ren-barzayakani',
    client: 'Barzayakani Judi',
    item: 'barzayakani-judi.com',
    type: 'Website',
    expiryDate: '2027-03-04',
    cycle: 'Annual',
    cost: 0,
    price: 250,
    commission: 25,
    link: 'https://barzayakani-judi.com',
    provider: '',
    status: 'Active',
    notes: '10% Commission for Kak Hiwa ($25) • Total Collected: $500'
  },
  {
    id: 'ren-haloyresh',
    client: 'Haloy Resh',
    item: 'haloyresh.com',
    type: 'Website',
    expiryDate: '2027-03-04',
    cycle: 'Annual',
    cost: 0,
    price: 250,
    commission: 25,
    link: 'https://haloyresh.com',
    provider: '',
    status: 'Active',
    notes: '10% Commission for Kak Hiwa ($25) • Total Collected: $500'
  },
  {
    id: 'ren-wasail',
    client: 'Wasail Al-Marifa',
    item: 'wasailalmarifa.com',
    type: 'Website',
    expiryDate: '2027-03-10',
    cycle: 'Annual',
    cost: 0,
    price: 260,
    commission: 26,
    link: 'https://wasailalmarifa.com',
    provider: '',
    status: 'Active',
    notes: '10% Commission for Kak Hiwa ($26) • Total Collected: $520'
  },
  {
    id: 'ren-pdo',
    client: 'PDO',
    item: 'PDO Website & System',
    type: 'Website',
    expiryDate: '2027-06-03',
    cycle: 'Annual',
    cost: 0,
    price: 300,
    commission: 0,
    link: '',
    provider: '',
    status: 'Active',
    notes: 'Published: 2026-08-01 • Total Collected: $300'
  },
  {
    id: 'ren-jolla',
    client: 'Jolla Group',
    item: 'Jolla Group Website',
    type: 'Website',
    expiryDate: '2027-07-01',
    cycle: 'Annual',
    cost: 0,
    price: 500,
    commission: 0,
    link: '',
    provider: '',
    status: 'Active',
    notes: 'Published: 2026-07-01 • Total Collected: $500'
  },
  {
    id: 'ren-golden-resource',
    client: 'Golden Resource',
    item: 'golden-resource.com',
    type: 'Website',
    expiryDate: '2027-08-01',
    cycle: 'Annual',
    cost: 0,
    price: 250,
    commission: 0,
    link: 'https://golden-resource.com',
    provider: '',
    status: 'Inactive',
    notes: 'Owes $180 • Total Collected: $470'
  },
  {
    id: 'ren-dasykar',
    client: 'Dasykar',
    item: 'dasykar.com',
    type: 'Website',
    expiryDate: '2027-08-01',
    cycle: 'Annual',
    cost: 0,
    price: 200,
    commission: 0,
    link: 'https://dasykar.com',
    provider: 'Domain Only',
    status: 'Inactive',
    notes: 'Domain Only • Total Collected: $20'
  },
  {
    id: 'ren-alamalsawaeq',
    client: 'Alam Al-Sawaeq',
    item: 'alamalsawaeq.com',
    type: 'Website',
    expiryDate: '2027-09-01',
    cycle: 'Annual',
    cost: 0,
    price: 333,
    commission: 25,
    link: 'https://alamalsawaeq.com',
    provider: '',
    status: 'Active',
    notes: '10% Commission for Kak Hiwa ($25) • Total Collected: $800'
  },
  {
    id: 'ren-ufee',
    client: 'UFEE',
    item: 'UFEE System',
    type: 'Website',
    expiryDate: '2027-10-01',
    cycle: 'Annual',
    cost: 0,
    price: 250,
    commission: 0,
    link: '',
    provider: '',
    status: 'Active',
    notes: 'Published: 2026-10-01 • Total Collected: $250'
  },
  {
    id: 'ren-adarbe',
    client: 'Adarbe',
    item: 'Adarbe.com',
    type: 'Website',
    expiryDate: '2029-10-19',
    cycle: '3 Years',
    cost: 0,
    price: 40,
    commission: 0,
    link: 'https://adarbe.com',
    provider: 'Domain Only',
    status: 'Active',
    notes: 'Domain Only (3 Years cycle) • Total Collected: $40'
  },
  {
    id: 'ren-myqrcode',
    client: 'MyQRCode Platform',
    item: 'myqrcode.site',
    type: 'Website',
    expiryDate: '2025-06-22',
    cycle: 'Annual',
    cost: 0,
    price: 250,
    commission: 0,
    link: 'https://myqrcode.site',
    provider: 'VPS & Domain',
    status: 'Active',
    notes: 'Published: 2024-06-22 • Total Collected: $100'
  },

  // 2. QR Code Clients (myqrcode.site)
  {
    id: 'ren-qr-petronol',
    client: 'Petronol',
    item: 'Petronol QR',
    type: 'QR Code',
    expiryDate: '2024-11-01',
    cycle: 'Annual',
    cost: 0,
    price: 10,
    commission: 5,
    link: 'https://myqrcode.site/petronol/',
    provider: 'myqrcode.site',
    status: 'Expired',
    notes: 'Agreement: $10 • Commission: $5'
  },
  {
    id: 'ren-qr-raidoo',
    client: 'Raidoo',
    item: 'Raidoo Oil QR',
    type: 'QR Code',
    expiryDate: '2026-11-08',
    cycle: 'Annual',
    cost: 0,
    price: 15,
    commission: 5,
    link: 'https://myqrcode.site/raido-oil/',
    provider: 'myqrcode.site',
    status: 'Active',
    notes: 'Agreement: $15 • Commission: $5 • Paid 21,000 IQD'
  },
  {
    id: 'ren-qr-soodbakhsh',
    client: 'Sood Bakhsh Food',
    item: 'Sood Bakhsh Food QR',
    type: 'QR Code',
    expiryDate: '2026-06-05',
    cycle: 'Annual',
    cost: 0,
    price: 15,
    commission: 5,
    link: 'https://myqrcode.site/sood-bakhsh-food/',
    provider: 'myqrcode.site',
    status: 'Expired',
    notes: 'Agreement: $15 • Last Payment: $10'
  },
  {
    id: 'ren-qr-younis',
    client: 'Younis Olive Oil',
    item: 'Younis Olive Oil QR',
    type: 'QR Code',
    expiryDate: '2026-05-23',
    cycle: 'Annual',
    cost: 0,
    price: 50,
    commission: 20,
    link: 'https://myqrcode.site/younis-olive-oil/',
    provider: 'myqrcode.site',
    status: 'Active',
    notes: 'Agreement: $50 • Last Payment: $30 (40,000 IQD)'
  },
  {
    id: 'ren-qr-zimzim',
    client: 'Zim Zim Ice',
    item: 'Zim Zim Ice QR',
    type: 'QR Code',
    expiryDate: '2025-08-06',
    cycle: 'Annual',
    cost: 0,
    price: 15,
    commission: 5,
    link: 'https://myqrcode.site/zimzim-ice/',
    provider: 'myqrcode.site',
    status: 'Expired',
    notes: 'Agreement: $15 • Last Payment: $15'
  },
  {
    id: 'ren-qr-wow',
    client: 'Wow Fastfood',
    item: 'Wow Fastfood QR',
    type: 'QR Code',
    expiryDate: '2027-02-10',
    cycle: 'Annual',
    cost: 0,
    price: 15,
    commission: 5,
    link: 'https://myqrcode.site/wow-fastfood/',
    provider: 'myqrcode.site',
    status: 'Active',
    notes: 'Agreement: $15 • Paid 15,000 IQD on 2026-02-10'
  },
  {
    id: 'ren-qr-pinkelle',
    client: 'PinkElle',
    item: 'PinkElle QR',
    type: 'QR Code',
    expiryDate: '2026-09-27',
    cycle: 'Annual',
    cost: 0,
    price: 50,
    commission: 10,
    link: 'https://myqrcode.site/pinkelle/',
    provider: 'myqrcode.site',
    status: 'Active',
    notes: 'Agreement: $50 • Last Payment: $30'
  },
  {
    id: 'ren-qr-poshia',
    client: 'Poshia Factory',
    item: 'Poshia Factory QR',
    type: 'QR Code',
    expiryDate: '2027-02-01',
    cycle: 'Annual',
    cost: 0,
    price: 50,
    commission: 30,
    link: 'https://myqrcode.site/poshiafactory/',
    provider: 'myqrcode.site',
    status: 'Active',
    notes: 'Agreement: $50 • Last Payment: $20 • Commission: $30'
  },
  {
    id: 'ren-qr-ghar',
    client: 'Ghar',
    item: 'Ghar QR Menu',
    type: 'QR Code',
    expiryDate: '2026-12-31',
    cycle: 'Annual',
    cost: 0,
    price: 50,
    commission: 0,
    link: 'https://myqrcode.site/ghar/',
    provider: 'myqrcode.site',
    status: 'Inactive',
    notes: 'Agreement: $50 • Not Started'
  },
  {
    id: 'ren-qr-wastahamza',
    client: 'Wasta Hamza',
    item: 'Wasta Hamza QR',
    type: 'QR Code',
    expiryDate: '2026-12-31',
    cycle: 'Annual',
    cost: 0,
    price: 20,
    commission: 0,
    link: 'https://myqrcode.site/wasta-hamza/',
    provider: 'myqrcode.site',
    status: 'Inactive',
    notes: 'Agreement: $20 • No Payment'
  }
];

// Real Services Catalog mapped to business activities
const INITIAL_SERVICES = [
  { id: 'srv-web-std', name: 'Website Hosting & Maintenance', category: 'Web Development', price: 250, unit: 'per year', description: 'Annual SSD hosting, SSL certificate, automated backups, and uptime support.', active: true },
  { id: 'srv-web-pro', name: 'Premium Corporate Web Solution', category: 'Web Development', price: 500, unit: 'per year', description: 'Enterprise website hosting, dedicated resources, monthly content updates, and monitoring.', active: true },
  { id: 'srv-mgr-cloud', name: 'Manager.io Cloud Database Hosting', category: 'Database', price: 400, unit: 'per year', description: 'Managed cloud database for Manager.io accounting, multi-user setup, and daily backups.', active: true },
  { id: 'srv-qr-basic', name: 'Dynamic QR Code Menu & Profile', category: 'QR Codes', price: 15, unit: 'per year', description: 'Custom dynamic QR code hosted on myqrcode.site with real-time menu/link routing.', active: true },
  { id: 'srv-qr-premium', name: 'Custom QR Code Campaign & Analytics', category: 'QR Codes', price: 50, unit: 'per year', description: 'Branded QR design, product page redirection, scan tracking, and priority updates.', active: true },
  { id: 'srv-dom-ren', name: 'Domain Name Registration & Renewal', category: 'Web Development', price: 20, unit: 'per year', description: 'Domain DNS configuration, WHOIS privacy protection, and annual renewal.', active: true },
  { id: 'srv-dom-3yr', name: 'Multi-Year Domain Bundle (3 Years)', category: 'Web Development', price: 40, unit: '3 years', description: '3-year advance domain name registration and DNS management.', active: true }
];

// Helper to create localStorage-synced store with auto-migration
function createLocalStore(key, fallback, cleanFilter = null) {
  let initial = fallback;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        let parsed = JSON.parse(stored);
        if (cleanFilter && Array.isArray(parsed)) {
          parsed = cleanFilter(parsed);
        }
        // If stored data exists and is populated, use it. Otherwise seed with real business dataset.
        if (Array.isArray(parsed) && parsed.length > 0) {
          initial = parsed;
        } else if (Array.isArray(fallback) && fallback.length > 0) {
          initial = fallback;
          localStorage.setItem(key, JSON.stringify(initial));
        }
      } else {
        localStorage.setItem(key, JSON.stringify(fallback));
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

export const renewals = createLocalStore('tl_renewals_v2', INITIAL_RENEWALS, removeDemoRenewals);
export const services = createLocalStore('tl_services_v2', INITIAL_SERVICES);
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

// Toast Notifications
export const toast = writable(null);
export function showToast(message, type = 'info', duration = 3000) {
  toast.set({ message, type });
  setTimeout(() => {
    toast.set(null);
  }, duration);
}

// Derived Alert Count
export const alertCount = derived(renewals, ($renewals) => {
  if (!$renewals) return 0;
  return $renewals.filter(r => {
    const days = daysUntil(r.expiryDate);
    return days <= 14 && r.status !== 'Renewed' && r.status !== 'Inactive';
  }).length;
});
