// app/khata/page.tsx — Digital Khata Ledger (Server Component)

import { getSupabaseServerClient } from '@/lib/supabase';
import KhataClient from './KhataClient';
import type { Ledger } from '@/types';

export const revalidate = 60;

async function getLedger(): Promise<Ledger[]> {
  const sb = getSupabaseServerClient();

  const { data, error } = await sb
    .from('ledger')
    .select('*, retailer:users!retailer_id(id, name, shop_name, phone, address)')
    .order('balance_due', { ascending: false });

  if (error) {
    console.error('Failed to fetch ledger:', error);
    return [];
  }

  return (data ?? []) as Ledger[];
}

export default async function KhataPage() {
  const entries = await getLedger();
  const totalOutstanding = entries.reduce((s, e) => s + e.balance_due, 0);

  return <KhataClient entries={entries} totalOutstanding={totalOutstanding} />;
}
