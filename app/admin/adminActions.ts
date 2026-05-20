'use server';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase';
import type { ActionResult, RouteDay } from '@/types';

export async function addProduct(payload: {
  name: string; category: string;
  wholesale_price: number; stock_qty: number; pack_size: number;
}): Promise<ActionResult<object>> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb.from('products').insert(payload).select().single();
  if (error) return { success: false, message: error.message };
  revalidatePath('/shop'); revalidatePath('/admin');
  return { success: true, message: 'Product added.', data };
}

export async function updateProduct(id: string, payload: {
  name: string; category: string;
  wholesale_price: number; stock_qty: number; pack_size: number;
}): Promise<ActionResult> {
  const sb = getSupabaseServerClient();
  const { error } = await sb.from('products').update(payload).eq('id', id);
  if (error) return { success: false, message: error.message };
  revalidatePath('/shop'); revalidatePath('/admin');
  return { success: true, message: 'Product updated.' };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const sb = getSupabaseServerClient();
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) return { success: false, message: error.message };
  revalidatePath('/shop'); revalidatePath('/admin');
  return { success: true, message: 'Product deleted.' };
}

export async function addRetailer(payload: {
  name: string; email: string; password: string;
  shop_name?: string; phone?: string; address?: string; route_day: RouteDay;
}): Promise<ActionResult<object>> {
  const sb = getSupabaseServerClient();
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
  });
  if (authError) return { success: false, message: authError.message };
  const { data, error } = await sb.from('users').insert({
    auth_id: authData.user.id,
    email: payload.email,
    name: payload.name,
    role: 'RETAILER',
    shop_name: payload.shop_name || null,
    phone: payload.phone || null,
    address: payload.address || null,
    route_day: payload.route_day,
  }).select().single();
  if (error) return { success: false, message: error.message };
  revalidatePath('/admin');
  return { success: true, message: 'Retailer added.', data };
}
