'use client';
// components/TopBar.tsx — Fixed top header with cart indicator

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from './CartDrawer';

export default function TopBar() {
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 border-b border-white/30 shadow-sm"
        style={{ background: 'rgba(247,249,251,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between px-4 md:px-8 h-[64px] md:ml-[280px]">
          {/* Logo */}
          <Link href="/shop">
            <span className="font-bold text-[20px] text-[#006c49] tracking-tight">WholesalePro</span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Route badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#eceef0] rounded-full text-[#006c49] text-[12px] font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              Today&apos;s Route
            </div>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-[#eceef0] transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#191c1e]" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#006c49] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#10b981] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
