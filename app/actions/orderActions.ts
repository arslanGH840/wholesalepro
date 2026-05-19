'use server';
// app/actions/orderActions.ts — Server Actions for order lifecycle

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getTodayRouteDay } from '@/lib/utils';
import type { ActionResult, PlaceOrderPayload, DeliveryStatus, RouteDay } from '@/types';

// ─── Place Order ───────────────────────────────────────────────────────────────

/**
 * Places a new order.
 * Validates:
 *  1. Retailer exists and their route_day matches today.
 *  2. All items have sufficient stock.
 * Uses a simulated 1-second delay to demonstrate optimistic UI.
 */
export async function placeOrder(
  payload: PlaceOrderPayload
): Promise<ActionResult<{ orderId: string }>> {
  // Simulate server latency for optimistic UI demo
  await new Promise(r => setTimeout(r, 1000));

  const sb = getSupabaseServerClient();

  try {
    // 1. Verify retailer and route day
    const { data: retailer, error: rErr } = await sb
      .from('users')
      .select('id, route_day, name')
      .eq('id', payload.retailerId)
      .single();

    if (rErr || !retailer) {
      return { success: false, message: 'Retailer not found. Please log in again.' };
    }

    const todayRoute = getTodayRouteDay();
    if (todayRoute && retailer.route_day !== todayRoute) {
      return {
        success: false,
        message: `Your delivery route (${retailer.route_day}) is not scheduled for today. Please order on your assigned delivery day.`,
      };
    }

    // 2. Check stock for every item
    for (const item of payload.items) {
      const { data: product, error: pErr } = await sb
        .from('products')
        .select('id, name, stock_qty')
        .eq('id', item.productId)
        .single();

      if (pErr || !product) {
        return { success: false, message: `Product not found: ${item.productId}` };
      }

      if (product.stock_qty < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock_qty}, Requested: ${item.quantity}.`,
        };
      }
    }

    // 3. Create order record
    const routeDay: RouteDay = (retailer.route_day as RouteDay) ?? todayRoute ?? 'MONDAY';
    const { data: order, error: oErr } = await sb
      .from('orders')
      .insert({
        retailer_id: payload.retailerId,
        route_day: routeDay,
        total_amount: payload.totalAmount,
        payment_status: payload.paymentStatus,
        delivery_status: 'PENDING',
        notes: payload.notes ?? null,
      })
      .select('id')
      .single();

    if (oErr || !order) {
      console.error('Order insert error:', oErr);
      return { success: false, message: 'Failed to create order. Please try again.' };
    }

    // 4. Insert order items
    const orderItems = payload.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.priceAtPurchase,
    }));

    const { error: itemsErr } = await sb.from('order_items').insert(orderItems);
    if (itemsErr) {
      console.error('Order items insert error:', itemsErr);
      // Rollback order
      await sb.from('orders').delete().eq('id', order.id);
      return { success: false, message: 'Failed to save order items. Order rolled back.' };
    }

    // 5. Decrement stock quantities
    for (const item of payload.items) {
      await sb.rpc('decrement_stock', {
        p_product_id: item.productId,
        p_qty: item.quantity,
      });
    }

    // 6. Handle Khata credit — upsert ledger balance
    if (payload.paymentStatus === 'KHATA_CREDIT') {
      const { data: ledger } = await sb
        .from('ledger')
        .select('id, balance_due')
        .eq('retailer_id', payload.retailerId)
        .single();

      if (ledger) {
        await sb
          .from('ledger')
          .update({
            balance_due: ledger.balance_due + payload.totalAmount,
            last_updated: new Date().toISOString(),
          })
          .eq('retailer_id', payload.retailerId);
      } else {
        await sb.from('ledger').insert({
          retailer_id: payload.retailerId,
          balance_due: payload.totalAmount,
          last_updated: new Date().toISOString(),
        });
      }
    }

    // 7. Revalidate affected pages
    revalidatePath('/shop');
    revalidatePath('/driver');
    revalidatePath('/khata');

    return {
      success: true,
      message: `Order placed successfully! Order #${order.id.slice(0, 8).toUpperCase()}`,
      data: { orderId: order.id },
    };
  } catch (err) {
    console.error('placeOrder unexpected error:', err);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

// ─── Update Delivery Status (Driver) ──────────────────────────────────────────

export async function updateDeliveryStatus(
  orderId: string,
  status: DeliveryStatus
): Promise<ActionResult> {
  await new Promise(r => setTimeout(r, 600));

  const sb = getSupabaseServerClient();

  try {
    const { error } = await sb
      .from('orders')
      .update({ delivery_status: status })
      .eq('id', orderId);

    if (error) {
      return { success: false, message: 'Failed to update delivery status.' };
    }

    revalidatePath('/driver');
    revalidatePath('/shop');

    return { success: true, message: `Order marked as ${status.toLowerCase()}.` };
  } catch {
    return { success: false, message: 'Unexpected error updating delivery status.' };
  }
}

// ─── Settle Khata Balance ──────────────────────────────────────────────────────

export async function settleKhataBalance(
  retailerId: string,
  amountPaid: number
): Promise<ActionResult> {
  await new Promise(r => setTimeout(r, 800));

  const sb = getSupabaseServerClient();

  try {
    const { data: ledger, error: lErr } = await sb
      .from('ledger')
      .select('id, balance_due')
      .eq('retailer_id', retailerId)
      .single();

    if (lErr || !ledger) {
      return { success: false, message: 'Ledger entry not found for this retailer.' };
    }

    const newBalance = Math.max(0, ledger.balance_due - amountPaid);

    const { error } = await sb
      .from('ledger')
      .update({ balance_due: newBalance, last_updated: new Date().toISOString() })
      .eq('retailer_id', retailerId);

    if (error) {
      return { success: false, message: 'Failed to settle balance.' };
    }

    revalidatePath('/khata');

    return {
      success: true,
      message: `Payment of Rs ${amountPaid.toLocaleString()} recorded. New balance: Rs ${newBalance.toLocaleString()}.`,
    };
  } catch {
    return { success: false, message: 'Unexpected error settling balance.' };
  }
}
