import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export function getSupabaseServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(supabaseUrl, serviceKey ?? supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

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
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;

    const adminSb = getSupabaseServerClient();
    const { data } = await adminSb
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    return data ?? null;
  } catch {
    return null;
  }
}
