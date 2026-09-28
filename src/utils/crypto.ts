import { Currency, UPIPaymentOption, OptionAvailability } from '../types';

/**
 * Hash password with salt using Web Crypto API SHA-256
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateTrackingId(prefix: 'ORD' | 'DEP' | 'WTH' | 'USR'): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  const time = Date.now().toString().slice(-4);
  return `${prefix}-${random}-${time}`;
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USDT') {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const symbol = currency === 'PKR' ? '₨' : '₹';
  return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface OptionStatusResult {
  isAvailable: boolean;
  status: 'active' | 'unavailable' | 'hidden' | 'expired' | 'upcoming';
  badgeText: string;
  badgeColor: string;
  remainingSeconds: number;
  countdownFormatted: string;
  shouldAutoRemove: boolean;
}

/**
 * Universal Countdown and Expiry Evaluation Helper
 */
export function evaluateTimer(
  startTime: string,
  expiryTime: string,
  afterExpiryAction: 'mark_unavailable' | 'auto_remove' = 'mark_unavailable',
  availability: OptionAvailability = 'active'
): OptionStatusResult {
  if (availability === 'hidden') {
    return {
      isAvailable: false,
      status: 'hidden',
      badgeText: 'Hidden',
      badgeColor: 'bg-slate-800 text-slate-500',
      remainingSeconds: 0,
      countdownFormatted: 'Hidden',
      shouldAutoRemove: true
    };
  }

  if (availability === 'unavailable') {
    return {
      isAvailable: false,
      status: 'unavailable',
      badgeText: 'Not Available Right Now',
      badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/40',
      remainingSeconds: 0,
      countdownFormatted: 'Unavailable',
      shouldAutoRemove: false
    };
  }

  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const expiry = new Date(expiryTime).getTime();

  if (now < start) {
    const diffSec = Math.max(0, Math.floor((start - now) / 1000));
    const diffMin = Math.round(diffSec / 60);
    return {
      isAvailable: false,
      status: 'upcoming',
      badgeText: `Starts in ${diffMin > 60 ? Math.floor(diffMin / 60) + 'h' : diffMin + 'm'}`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      remainingSeconds: diffSec,
      countdownFormatted: `Starts in ${diffMin}m`,
      shouldAutoRemove: false
    };
  }

  if (now > expiry) {
    const isAutoRemove = afterExpiryAction === 'auto_remove';
    return {
      isAvailable: false,
      status: 'expired',
      badgeText: isAutoRemove ? 'Expired (Auto-Removed)' : 'Expired (Unavailable)',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      remainingSeconds: 0,
      countdownFormatted: '00m 00s',
      shouldAutoRemove: isAutoRemove
    };
  }

  const remainingSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  let countdownFormatted = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    countdownFormatted = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    countdownFormatted = `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  } else {
    countdownFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return {
    isAvailable: true,
    status: 'active',
    badgeText: 'Active',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    remainingSeconds,
    countdownFormatted,
    shouldAutoRemove: false
  };
}

export function evaluateUPIOption(option: UPIPaymentOption): OptionStatusResult {
  return evaluateTimer(
    option.startTime,
    option.expiryTime,
    option.afterExpiryAction || 'mark_unavailable',
    option.availability
  );
}
