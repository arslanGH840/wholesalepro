'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface UserProfile {
  name: string;
  shop_name: string | null;
  role: string;
}

export default function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname.startsWith('/login');

  useEffect(() => {
    if (isLoginPage) { setReady(true); return; }

    const sb = getSupabaseBrowserClient();

    async function loadUser() {
      const { data: { user: authUser } } = await sb.auth.getUser();
      if (!authUser) { setReady(true); return; }

      const { data } = await sb
        .from('users')
        .select('name, shop_name, role')
        .eq('auth_id', authUser.id)
        .single();

      setUser(data ?? null);
      setReady(true);
    }

    loadUser();

    const { data: { subscription } } = sb.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, [pathname, isLoginPage]);

  const showNav = !isLoginPage && !!user;
  const userInitial = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <>
      {showNav && (
        <Sidebar
          userName={user!.name}
          userShop={user!.shop_name ?? undefined}
          userRole={user!.role}
        />
      )}
      {showNav && (
        <TopBar userInitial={userInitial} userName={user!.name} />
      )}
      <main className={showNav ? 'md:ml-[280px] pt-[64px] min-h-screen' : 'min-h-screen'}>
        {ready ? children : null}
      </main>
    </>
  );
}
