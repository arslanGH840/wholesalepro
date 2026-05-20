'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Props {
  userName?: string;
  userShop?: string;
  userRole?: string;
}

const NAV_ITEMS = [
  { href: '/shop',     icon: 'inventory_2',            label: 'Inventory' },
  { href: '/orders',   icon: 'receipt_long',           label: 'Orders' },
  { href: '/driver',   icon: 'local_shipping',         label: 'Driver Route' },
  { href: '/khata',    icon: 'account_balance',        label: 'Khata Ledger' },
  { href: '/checkout', icon: 'shopping_cart_checkout', label: 'Checkout' },
];
const ADMIN_ITEMS = [
  { href: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel' },
];

export default function Sidebar({ userName, userShop, userRole }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
    toast.success('Signed out.');
    router.push('/login');
    router.refresh();
  };

  const initial = (userName ?? 'U').charAt(0).toUpperCase();
  const allNav = userRole === 'ADMIN' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <aside
      className="h-full w-[280px] fixed left-0 top-0 hidden md:flex flex-col border-r border-[#bbcabf]/30 shadow-md pt-[64px] z-40"
      style={{ backgroundColor: '#eceef0' }}
    >
      <div className="flex flex-col gap-1 py-6 pr-3 overflow-y-auto flex-1">
        <div className="px-6 pb-4 mb-2 border-b border-[#bbcabf]/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {initial}
            </div>
            <div>
              <div className="font-semibold text-[15px] text-[#191c1e]">{userShop ?? userName ?? 'Loading…'}</div>
              <div className="text-[12px] text-[#3c4a42]">{userRole === 'ADMIN' ? 'Administrator' : 'Verified Wholesaler'}</div>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {allNav.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-6 py-3 rounded-r-full transition-all duration-200 text-[15px] select-none
                  ${active ? 'bg-[#dae2fd] text-[#5c647a] font-semibold' : 'text-[#3c4a42] hover:bg-[#e0e3e5]/70 hover:translate-x-1'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#bbcabf]/30">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-red-600 font-semibold hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
