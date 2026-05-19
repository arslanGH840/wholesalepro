// app/driver/page.tsx — Driver route management (Server Component)

import { getSupabaseServerClient } from '@/lib/supabase';
import DriverRouteClient from './DriverRouteClient';
import type { Order } from '@/types';
import { getTodayRouteDay } from '@/lib/utils';

export const revalidate = 30;

async function getTodayOrders(): Promise<Order[]> {
  const sb = getSupabaseServerClient();
  const today = getTodayRouteDay();

  if (!today) return [];

  const { data, error } = await sb
    .from('orders')
    .select(`
      *,
      retailer:users!retailer_id(id, name, shop_name, address, phone),
      items:order_items(*, product:products(*))
    `)
    .eq('route_day', today)
    .neq('delivery_status', 'CANCELLED')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch driver orders:', error);
    return [];
  }

  return (data ?? []) as Order[];
}

export default async function DriverPage() {
  const orders = await getTodayOrders();
  const today = getTodayRouteDay();

  return <DriverRouteClient orders={orders} todayRoute={today} />;
}
