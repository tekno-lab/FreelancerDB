import { writable, derived } from 'svelte/store';

export const translations = {
  en: {
    // Navigation
    nav_renewals: "Renewals",
    nav_quotes: "Quotes",
    nav_services: "Services",
    nav_alerts: "Alerts",
    nav_settings: "Settings",

    // Header
    header_suite: "SUITE",
    header_live: "Live Sheet",
    header_local: "Local Mode",
    header_offline: "Offline",
    header_sync: "Sync with Google Sheets",
    header_add: "Add",

    // Stats
    stat_tracked: "Tracked",
    stat_revenue: "Revenue",
    stat_due: "Due ≤14d",

    // Search & Filters
    search_placeholder: "Search client, domain, or database...",
    filter_all: "All",
    filter_active: "Active",
    filter_inactive: "Inactive",
    filter_website: "🌐 Websites",
    filter_database: "💾 Databases",
    filter_qrcode: "📱 QR Codes",
    filter_due: "Due Soon",

    // Renewals List
    empty_renewals_title: "No renewals tracked yet",
    empty_renewals_desc: "Tap the Add button above or connect your Google Sheet in Settings to sync your client renewals.",
    card_price: "Price Charged",
    card_cost: "Cost",
    card_profit: "Profit",
    card_commission: "Commission",
    card_open_link: "Open Link",
    card_status_active: "Active",
    card_status_inactive: "Inactive",
    card_renew: "Renew",
    card_edit: "Edit",
    card_delete: "Delete",
    card_gcal_synced: "GCal 7d",
    confirm_delete: "Delete renewal for",

    // Modal
    modal_title_new: "New Renewal Entry",
    modal_title_edit: "Edit Renewal",
    modal_subtitle: "Track websites, QR codes, or Manager.io databases",
    modal_status: "Customer Status",
    modal_class: "Service Classification",
    modal_class_db_note: "For Manager.io clients' database subscriptions and hosting.",
    modal_client: "Client Name *",
    modal_item: "Domain / Website Name *",
    modal_item_db: "Database / Company Name *",
    modal_item_qr: "Campaign / QR Title *",
    modal_expiry: "Renewal / Expiry Date *",
    modal_cycle: "Cycle",
    modal_provider: "Provider / Host",
    modal_price: "Price Charged",
    modal_cost: "Direct Cost",
    modal_commission: "Commission / Referral",
    modal_link: "Live Website / QR Link",
    modal_gcal_title: "Google Calendar Auto-Sync",
    modal_gcal_desc: "Pushes 7-day advance reminder alert",
    modal_notes: "Notes / Instructions",
    modal_save: "Save & Sync Renewal",
    modal_save_changes: "Save Renewal Changes",

    // Quote Builder
    quotes_title: "Quote Builder",
    quotes_subtitle: "Generate mobile price offers & Drive PDFs",
    quotes_clear: "Clear",
    quotes_client_info: "Client Information",
    quotes_client_name: "Client / Business Name *",
    quotes_email: "Email",
    quotes_phone: "Phone",
    quotes_items: "Quote Line Items",
    quotes_no_items: "No items selected yet.",
    quotes_no_items_hint: "Select from your service catalog or add new services below.",
    quotes_subtotal: "Subtotal:",
    quotes_discount: "Discount",
    quotes_total: "Grand Total:",
    quotes_compile_btn: "Compile & Save PDF to Drive",
    quotes_compiling: "Compiling PDF to Google Drive...",
    quotes_pdf_compiled: "PDF Compiled to Google Drive!",
    quotes_saved_in: "Saved in Tekno Labs Quotations",
    quotes_open_pdf: "Open PDF Quotation",
    quotes_copy_link: "Copy Link",
    quotes_catalog_title: "Price Library Catalog",
    quotes_tap_hint: "Tap to insert",
    quotes_issued_title: "Issued Quotations",
    quotes_view_pdf: "View PDF",

    // Services Manager
    srv_title: "Services & Pricing Library",
    srv_subtitle: "Standard rates for quote generation",
    srv_add_btn: "Add Service",
    srv_empty_title: "No services added yet",
    srv_empty_desc: "Click 'Add Service' above or sync your services from your Google Sheet.",
    srv_modal_new: "New Service",
    srv_modal_edit: "Edit Service",
    srv_name: "Service Title *",
    srv_category: "Category",
    srv_rate: "Default Rate",
    srv_unit: "Billing Unit",
    srv_desc: "Description",
    srv_save: "Save Service",

    // Notification Center
    alerts_title: "Notification & Alert Center",
    alerts_subtitle: "Automated deadline tracking & 7-day advance reminders",
    alerts_empty_title: "All Renewals Up-To-Date!",
    alerts_empty_desc: "No services due for renewal in the immediate 30-day window.",
    alerts_expired: "Expired Assets",
    alerts_due7: "Urgent: Due in 7 Days",
    alerts_due14: "Due Within 2 Weeks",
    alerts_due30: "Due This Month",
    alerts_share: "Share",
    alerts_renew1yr: "Renew +1Yr",

    // Settings
    settings_title: "System Settings & Connection",
    settings_subtitle: "Configure language, appearance, and Google Sheet API",
    settings_lang_title: "Language / زمان",
    settings_lang_desc: "Select interface language",
    settings_theme_title: "Appearance Theme",
    settings_theme_desc: "Switch between dark OLED and clean light mode",
    settings_dark: "Dark Mode",
    settings_light: "Light Mode",
    settings_gateway_title: "Google Apps Script Web App Gateway",
    settings_url: "Web App Deployment URL",
    settings_url_hint: "Get this from: Google Sheets > Extensions > Apps Script > Deploy > Web App.",
    settings_key: "Manager Access Key",
    settings_key_hint: "Found in cell B4 of your 'Setup' tab in Google Sheets.",
    settings_currency: "Default Currency",
    settings_test_btn: "Test Connection",
    settings_save_btn: "Save",
    settings_pwa_title: "Install on Smartphone",
    settings_pwa_ios: "iOS (iPhone Safari): Tap Share > Select 'Add to Home Screen'.",
    settings_pwa_android: "Android (Chrome): Tap menu > Select 'Install app'.",
    settings_export: "Export Backup",
    settings_clear_cache: "Clear Cache"
  },

  ku: {
    // Navigation
    nav_renewals: "نوێکردنەوەکان",
    nav_quotes: "ئۆفەرەکان",
    nav_services: "خزمەتگوزارییەکان",
    nav_alerts: "ئاگادارییەکان",
    nav_settings: "ڕێکخستنەکان",

    // Header
    header_suite: "سوییت",
    header_live: "شیت بەستراوە",
    header_local: "باری ناوخۆیی",
    header_offline: "ئۆفلاین",
    header_sync: "هاوکاتکردن لەگەڵ شیت",
    header_add: "زیادکردن",

    // Stats
    stat_tracked: "تۆمارکراو",
    stat_revenue: "داهات",
    stat_due: "ماوە ≤١٤ ڕۆژ",

    // Search & Filters
    search_placeholder: "گەڕان بۆ کڕیار، دۆمەین، یان داتابەیس...",
    filter_all: "هەموو",
    filter_active: "چالاک",
    filter_inactive: "ناچالاک",
    filter_website: "🌐 وێبسایتەکان",
    filter_database: "💾 داتابەیسەکان",
    filter_qrcode: "📱 کۆدی QR",
    filter_due: "نزیک لە بەسەرچوون",

    // Renewals List
    empty_renewals_title: "هیچ نوێکردنەوەیەک تۆمار نەکراوە",
    empty_renewals_desc: "دوگمەی 'زیادکردن' دابگرە یان شیتەکەت ببەستەوە بۆ هاوکاتکردنی داتاکانت.",
    card_price: "نرخی فرۆشتن",
    card_cost: "تێچوو",
    card_profit: "قازانج",
    card_commission: "کۆمیسیۆن",
    card_open_link: "کردنەوەی بەستەر",
    card_status_active: "چالاک",
    card_status_inactive: "ناچالاک",
    card_renew: "نوێکردنەوە",
    card_edit: "دەستکاری",
    card_delete: "سڕینەوە",
    card_gcal_synced: "ساڵنامە 7ڕ",
    confirm_delete: "ئایا دڵنیایت لە سڕینەوەی",

    // Modal
    modal_title_new: "تۆماری نوێکردنەوەی نوێ",
    modal_title_edit: "دەستکاری نوێکردنەوە",
    modal_subtitle: "چاودێری وێبسایت، کۆدی QR، یان داتابەیسی Manager.io",
    modal_status: "دۆخی کڕیار",
    modal_class: "جۆری خزمەتگوزاری",
    modal_class_db_note: "بۆ بەشداریکردن و هۆستینگی داتابەیسی کڕیارانی Manager.io.",
    modal_client: "ناوی کڕیار *",
    modal_item: "ناوی دۆمەین / پڕۆژە *",
    modal_item_db: "ناوی کۆمپانیا / داتابەیس *",
    modal_item_qr: "ناوی کامپەین / کۆدی QR *",
    modal_expiry: "بەرواری بەسەرچوون *",
    modal_cycle: "سووڕی پارەدان",
    modal_provider: "دابینکەر / سێرڤەر",
    modal_price: "نرخی فرۆشتن",
    modal_cost: "تێچووی سەرەکی",
    modal_commission: "کۆمیسیۆن / پشکی هاوبەش",
    modal_link: "بەستەری وێبسایت یان QR",
    modal_gcal_title: "هاوکاتکردنی ئۆتۆماتیکی لەگەڵ Google Calendar",
    modal_gcal_desc: "ئاگادارکردنەوەی پێشوەختە دەنێرێت بە 7 ڕۆژ پێش بەسەرچوون",
    modal_notes: "تێبینییەکان",
    modal_save: "پاشەکەوتکردن و هاوکاتکردن",
    modal_save_changes: "پاشەکەوتکردنی گۆڕانکارییەکان",

    // Quote Builder
    quotes_title: "دروستکەری ئۆفەر",
    quotes_subtitle: "ئۆفەری فەرمی دروستبکە و ڕاستەوخۆ بیکە بە PDF لە Google Drive",
    quotes_clear: "سڕینەوە",
    quotes_client_info: "زانیاری کڕیار",
    quotes_client_name: "ناوی کڕیار / کۆمپانیا *",
    quotes_email: "ئیمەیڵ",
    quotes_phone: "ژمارەی مۆبایل",
    quotes_items: "بڕگەکانی ئۆفەر",
    quotes_no_items: "هیچ بڕگەیەک هەڵنەبژێردراوە.",
    quotes_no_items_hint: "خزمەتگوزارییەک لە خوارەوە هەڵبژێرە بۆ زیادکردن.",
    quotes_subtotal: "کۆی سەرەتایی:",
    quotes_discount: "داشکاندن",
    quotes_total: "کۆی گشتی:",
    quotes_compile_btn: "دروستکردن و پاشەکەوتکردنی PDF لە Drive",
    quotes_compiling: "لە دروستکردنی PDF دایە لە Google Drive...",
    quotes_pdf_compiled: "فایلی PDF لە Google Drive پاشەکەوت کرا!",
    quotes_saved_in: "پاشەکەوت کرا لە بوخچەی Tekno Labs Quotations",
    quotes_open_pdf: "کردنەوەی فایلی PDF",
    quotes_copy_link: "کۆپیکردنی بەستەر",
    quotes_catalog_title: "لیستی نرخەکان",
    quotes_tap_hint: "دابگرە بۆ زیادکردن",
    quotes_issued_title: "ئۆفەرە دەرکراوەکان",
    quotes_view_pdf: "بینینی PDF",

    // Services Manager
    srv_title: "لیستی خزمەتگوزاری و نرخەکان",
    srv_subtitle: "نرخە بنەڕەتییەکان بۆ ئۆفەرەکان",
    srv_add_btn: "خزمەتگوزاری نوێ",
    srv_empty_title: "هیچ خزمەتگوزارییەک زیاد نەکراوە",
    srv_empty_desc: "دوگمەی 'خزمەتگوزاری نوێ' دابگرە یان لە شیتەوە هاوکاتی بکە.",
    srv_modal_new: "خزمەتگوزاری نوێ",
    srv_modal_edit: "دەستکاری خزمەتگوزاری",
    srv_name: "ناوی خزمەتگوزاری *",
    srv_category: "پۆل",
    srv_rate: "نرخی بنەڕەتی",
    srv_unit: "یەکەی کات",
    srv_desc: "ڕوونکردنەوە",
    srv_save: "پاشەکەوتکردنی خزمەتگوزاری",

    // Notification Center
    alerts_title: "ناوەندی ئاگادارییەکان",
    alerts_subtitle: "چاودێری بەروارەکان و ئاگاداری پێشوەختەی 7 ڕۆژە",
    alerts_empty_title: "هەموو بەروارەکان نوێن!",
    alerts_empty_desc: "هیچ خزمەتگوزارییەک نییە لە ماوەی ٣٠ ڕۆژی داهاتوودا بەسەربچێت.",
    alerts_expired: "بەسەرچووەکان",
    alerts_due7: "بەپەلە: بەسەردەچێت لە ٧ ڕۆژدا",
    alerts_due14: "لە ماوەی دوو هەفتەدا",
    alerts_due30: "لە ماوەی ئەم مانگەدا",
    alerts_share: "ناردنی ئاگاداری",
    alerts_renew1yr: "نوێکردنەوە +١ ساڵ",

    // Settings
    settings_title: "ڕێکخستنەکانی سیستەم و پەیوەندی",
    settings_subtitle: "ڕێکخستنی زمان، ڕووکار، و بەستەری شیت",
    settings_lang_title: "زمان / Language",
    settings_lang_desc: "زمانی بەرنامە دیاریبکە",
    settings_theme_title: "شێوازی ڕووکار",
    settings_theme_desc: "گۆڕین لە نێوان دۆخی تاریک و ڕووناک",
    settings_dark: "دۆخی تاریک",
    settings_light: "دۆخی ڕووناک",
    settings_gateway_title: "بەستەری Google Apps Script",
    settings_url: "بەستەری Web App",
    settings_url_hint: "لێرەوە وەریدەگریت: Extensions > Apps Script > Deploy > Web App",
    settings_key: "کلیلی تێپەڕبوونی بەڕێوەبەر",
    settings_key_hint: "لە خانەی B4 لە تابی Setup ی شیتەکەتدا دەستت دەکەوێت.",
    settings_currency: "دراوی سەرەکی",
    settings_test_btn: "تاقیکردنەوەی پەیوەندی",
    settings_save_btn: "پاشەکەوتکردن",
    settings_pwa_title: "دابەزاندن لەسەر مۆبایل",
    settings_pwa_ios: "ئایفۆن (سەفاری): دوگمەی Share دابگرە > Add to Home Screen هەڵبژێرە.",
    settings_pwa_android: "ئەندرۆید (کرۆم): سێ خاڵەکە دابگرە > Install app یان Add to Home screen هەڵبژێرە.",
    settings_export: "هەناردەکردنی پاڵپشت",
    settings_clear_cache: "سڕینەوەی کاش"
  }
};

function createLangStore() {
  let initial = 'en';
  if (typeof window !== 'undefined') {
    initial = localStorage.getItem('tl_lang') || 'en';
    applyDir(initial);
  }
  const store = writable(initial);

  return {
    subscribe: store.subscribe,
    set: (l) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tl_lang', l);
        applyDir(l);
      }
      store.set(l);
    }
  };
}

function applyDir(l) {
  if (typeof document !== 'undefined') {
    const isRtl = l === 'ku';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', l);
  }
}

export const lang = createLangStore();
export const dir = derived(lang, ($l) => $l === 'ku' ? 'rtl' : 'ltr');

// Reactive translation helper
export function t(key, currentLang = 'en') {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}
