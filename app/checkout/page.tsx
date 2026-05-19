'use client';
// app/checkout/page.tsx — Checkout with delivery schedule info

import { useCart } from '@/context/CartContext';
import { ShoppingCart, Calendar, Truck, Info } from 'lucide-react';
import { formatPKR, ROUTE_LABELS, ROUTE_DAYS, getTodayRouteDay } from '@/lib/utils';
import type { RouteDay } from '@/types';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart } = useCart();
  const today = getTodayRouteDay();

  const routeSchedule: { day: RouteDay; label: string; active: boolean }[] = ROUTE_DAYS.map(d => ({
    day: d,
    label: ROUTE_LABELS[d],
    active: d === today,
  }));

  return (
    <div className="px-4 md:px-8 py-6 max-w-[900px] mx-auto">
      <h1 className="text-[28px] md:text-[32px] font-bold text-[#191c1e] tracking-tight mb-6">
        Checkout & Delivery Schedule
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left — Cart Summary */}
        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-[#006c49]" />
              <h2 className="font-bold text-[16px] text-[#191c1e]">Order Summary</h2>
            </div>

            {cart.items.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-[#6c7a71]">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-[14px]">No items in cart</p>
                <Link
                  href="/shop"
                  className="mt-3 text-[13px] text-[#006c49] font-semibold hover:underline"
                >
                  Browse Inventory →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4 max-h-[300px] overflow-y-auto">
                  {cart.items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-[#bbcabf]/30 last:border-0">
                      <div>
                        <p className="font-medium text-[13px] text-[#191c1e]">{product.name}</p>
                        <p className="text-[12px] text-[#3c4a42]">{formatPKR(product.wholesale_price)} × {quantity}</p>
                      </div>
                      <p className="font-bold text-[13px] text-[#006c49] tabular-nums">
                        {formatPKR(product.wholesale_price * quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-[16px] text-[#191c1e]">Total</span>
                  <span className="font-bold text-[20px] text-[#006c49] tabular-nums">{formatPKR(cart.totalAmount)}</span>
                </div>
                <p className="text-[12px] text-[#3c4a42] mt-2">
                  Use the cart drawer (top right) to adjust quantities and place your order.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right — Delivery Schedule */}
        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#006c49]" />
              <h2 className="font-bold text-[16px] text-[#191c1e]">Weekly Delivery Routes</h2>
            </div>
            <div className="flex flex-col gap-2">
              {routeSchedule.map(({ day, label, active }) => (
                <div
                  key={day}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    active
                      ? 'bg-[#006c49] text-white shadow-sm'
                      : 'bg-[#f2f4f6] text-[#3c4a42]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className={`w-4 h-4 ${active ? 'text-white' : 'text-[#6c7a71]'}`} />
                    <span className={`text-[13px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
                  </div>
                  {active && (
                    <span className="text-[11px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                      TODAY
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Route policy note */}
          <div className="glass-card rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-[#855300] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#3c4a42] leading-relaxed">
              Orders are only accepted on your assigned delivery route day. Contact your wholesaler to update your route assignment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
