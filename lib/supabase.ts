// lib/supabase.ts — Supabase client helpers (browser + server)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser (singleton) client — used in Client Components
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Server client — use in Server Components and Server Actions
export function getSupabaseServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Use service role for mutations; anon key for reads
  return createClient(supabaseUrl, serviceKey ?? supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
