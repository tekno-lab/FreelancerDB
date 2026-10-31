// Utility functions for Tekno Labs PWA

export function formatMoney(amount, currency = 'USD') {
  const num = Number(amount) || 0;
  if (currency === 'IQD') {
    return num.toLocaleString() + ' IQD';
  }
  return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function daysUntil(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getUrgency(days) {
  if (days < 0) {
    return {
      label: `Expired ${Math.abs(days)}d ago`,
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
      dotClass: 'bg-red-500',
      level: 'expired'
    };
  }
  if (days === 0) {
    return {
      label: 'Expires Today!',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
      dotClass: 'bg-red-500',
      level: 'today'
    };
  }
  if (days <= 7) {
    return {
      label: `${days} days left`,
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      dotClass: 'bg-rose-500',
      level: 'urgent'
    };
  }
  if (days <= 14) {
    return {
      label: `${days} days left`,
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-500',
      level: 'soon'
    };
  }
  if (days <= 30) {
    return {
      label: `${days} days left`,
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      dotClass: 'bg-yellow-400',
      level: 'upcoming'
    };
  }
  return {
    label: `${days} days left`,
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    level: 'healthy'
  };
}

export function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(12);
    } catch (e) {}
  }
}
