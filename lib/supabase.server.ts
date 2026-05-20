import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getSupabaseSSRClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

export async function getCurrentUserProfile() {
  try {
    const sb = await getSupabaseSSRClient();
    // Use getUser() instead of getSession() — validates token with Supabase server
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) return null;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminSb = createClient(supabaseUrl, serviceKey ?? supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data } = await adminSb
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    return data ?? null;
  } catch {
    return null;
  }
}
