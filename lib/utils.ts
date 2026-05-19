// lib/utils.ts — Shared utility helpers
import type { RouteDay } from '@/types';

export const ROUTE_DAYS: RouteDay[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
];

export const ROUTE_LABELS: Record<RouteDay, string> = {
  MONDAY: 'Monday — Route A',
  TUESDAY: 'Tuesday — Route B',
  WEDNESDAY: 'Wednesday — Route C',
  THURSDAY: 'Thursday — Route D',
  FRIDAY: 'Friday — Route E',
  SATURDAY: 'Saturday — Route F',
};

/**
 * Returns today's RouteDay enum value (or null if Sunday).
 */
export function getTodayRouteDay(): RouteDay | null {
  const days: (RouteDay | null)[] = [
    null,          // Sunday
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  return days[new Date().getDay()] ?? null;
}

/**
 * Formats a number as Pakistani Rupee currency.
 */
export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Returns Tailwind colour classes for delivery/payment status badges.
 */
export function deliveryStatusClass(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    LOADED: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
}

export function paymentStatusClass(status: string): string {
  const map: Record<string, string> = {
    PAID: 'bg-emerald-100 text-emerald-800',
    KHATA_CREDIT: 'bg-purple-100 text-purple-800',
    PENDING: 'bg-amber-100 text-amber-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
