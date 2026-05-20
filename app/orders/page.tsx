import { getSupabaseServerClient } from '@/lib/supabase';
import OrdersClient from './OrdersClient';
import type { Order } from '@/types';

export const revalidate = 30;

export default async function OrdersPage() {
  const sb = getSupabaseServerClient();
  const { data } = await sb
    .from('orders')
    .select('*, retailer:users(name, shop_name, phone), items:order_items(*, product:products(name, wholesale_price))')
    .order('created_at', { ascending: false })
    .limit(100);
  return <OrdersClient orders={(data ?? []) as Order[]} />;
}
