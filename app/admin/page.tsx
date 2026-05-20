import { getSupabaseServerClient } from '@/lib/supabase';
import AdminClient from './AdminClient';
import type { Product, User } from '@/types';

export const revalidate = 0;

export default async function AdminPage() {
  const sb = getSupabaseServerClient();
  const [{ data: products }, { data: retailers }] = await Promise.all([
    sb.from('products').select('*').order('category').order('name'),
    sb.from('users').select('*').eq('role', 'RETAILER').order('name'),
  ]);
  return <AdminClient products={(products ?? []) as Product[]} retailers={(retailers ?? []) as User[]} />;
}
