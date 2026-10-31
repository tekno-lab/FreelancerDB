import { writable, derived } from 'svelte/store';
import { daysUntil } from './utils.js';

// Default initial data for immediate offline demonstration
const INITIAL_RENEWALS = [
  {
    id: "ren-demo-1",
    client: "Al-Mansour Trading",
    item: "almansour-trade.com",
    type: "Website",
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    cycle: "Annual",
    cost: 45,
    price: 180,
    provider: "Namecheap / DigitalOcean",
    status: "Due Soon",
    calendarEventId: "",
    notes: "Client requested email renewal notice sent to finance director."
  },
  {
    id: "ren-demo-2",
    client: "Kurdistan Pharma",
    item: "Manager.io Accounting Cloud",
    type: "Database",
    expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    cycle: "Annual",
    cost: 60,
    price: 240,
    provider: "Tekno Labs VPS Server 1",
    status: "Active",
    calendarEventId: "",
    notes: "Manager.io Multi-user DB with 4 active accountant seats."
  },
  {
    id: "ren-demo-3",
    client: "Skyline Restaurant & Lounge",
    item: "Dynamic Food Menu QR",
    type: "QR Code",
    expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    cycle: "Annual",
    cost: 10,
    price: 75,
    provider: "Tekno Labs QR Platform",
    status: "Active",
    calendarEventId: "",
    notes: "Dynamic URL redirecting to digital PDF menu."
  },
  {
    id: "ren-demo-4",
    client: "Delta Logistics",
    item: "delta-express.iq",
    type: "Website",
    expiryDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    cycle: "Annual",
    cost: 35,
    price: 150,
    provider: "Cloudflare / Hostinger",
    status: "Active",
    calendarEventId: "",
    notes: "Corporate portal renewal."
  }
];

const INITIAL_SERVICES = [
  { id: "srv-1", name: "Website Hosting & Maintenance", category: "Web Development", price: 150, unit: "per year", description: "Reliable SSD hosting, SSL certificate, weekly backups, and maintenance.", active: true },
  { id: "srv-2", name: "WordPress Care & Security", category: "Web Development", price: 120, unit: "per year", description: "Core & plugin updates, malware scanning, performance tuning.", active: true },
  { id: "srv-3", name: "Dynamic QR Code Campaign", category: "QR Codes", price: 60, unit: "per year", description: "Dynamic redirect routing, scan analytics, high-res vector export.", active: true },
  { id: "srv-4", name: "Manager.io Cloud Database Subscription", category: "Database", price: 200, unit: "per year", description: "Multi-user cloud hosting, automated daily backups, version upgrades.", active: true },
  { id: "srv-5", name: "Manager.io Accounting Setup & Customization", category: "Database", price: 250, unit: "one-time", description: "Chart of accounts, custom invoice templates, theme branding.", active: true },
  { id: "srv-6", name: "Domain Name Renewal (.com)", category: "Web Development", price: 20, unit: "per year", description: "Domain DNS management and WHOIS privacy protection.", active: true },
  { id: "srv-7", name: "Professional Business Email Setup", category: "Business Systems", price: 80, unit: "one-time", description: "Custom domain email configuration (Google Workspace / IMAP / DKIM / SPF).", active: true }
];

// Helper to create localStorage-synced store
function createLocalStore(key, fallback) {
  let initial = fallback;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored) initial = JSON.parse(stored);
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

export const config = createLocalStore('tl_config', {
  webAppUrl: '',
  apiKey: '',
  currency: 'USD',
  calendarReminderDays: 7
});

export const renewals = createLocalStore('tl_renewals', INITIAL_RENEWALS);
export const services = createLocalStore('tl_services', INITIAL_SERVICES);
export const quotes = createLocalStore('tl_quotes', []);

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
  return $renewals
    .map(r => ({ ...r, daysLeft: daysUntil(r.expiryDate) }))
    .filter(r => r.daysLeft <= 14 && r.status !== 'Renewed')
    .sort((a, b) => a.daysLeft - b.daysLeft);
});

export const alertCount = derived(urgentRenewals, ($urgent) => $urgent.length);
