'use client';
// components/Sidebar.tsx — Web sidebar navigation

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/shop',     icon: 'inventory_2',    label: 'Inventory' },
  { href: '/driver',   icon: 'local_shipping', label: 'Driver Route' },
  { href: '/khata',    icon: 'account_balance', label: 'Khata Ledger' },
  { href: '/checkout', icon: 'shopping_cart_checkout', label: 'Checkout' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="h-full w-[280px] fixed left-0 top-0 hidden md:flex flex-col border-r border-[#bbcabf]/30 shadow-md pt-[64px] z-40"
      style={{ backgroundColor: '#eceef0' }}
    >
      <div className="flex flex-col gap-1 py-6 pr-3 overflow-y-auto flex-1">
        {/* Profile block */}
        <div className="px-6 pb-4 mb-2 border-b border-[#bbcabf]/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white font-bold text-lg shrink-0">
              A
            </div>
            <div>
              <div className="font-semibold text-[15px] text-[#191c1e]">Aslam Traders</div>
              <div className="text-[12px] text-[#3c4a42]">Verified Wholesaler</div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-6 py-3 rounded-r-full transition-all duration-200 text-[15px] select-none
                  ${active
                    ? 'bg-[#dae2fd] text-[#5c647a] font-semibold'
                    : 'text-[#3c4a42] hover:bg-[#e0e3e5]/70 hover:translate-x-1'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom info */}
      <div className="p-6 border-t border-[#bbcabf]/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006c49] text-[20px]">local_shipping</span>
          <div className="flex flex-col">
            <span className="font-semibold text-[13px] text-[#006c49]">Suzuki Pickup</span>
            <span className="text-[11px] text-[#3c4a42]">Active Vehicle</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
