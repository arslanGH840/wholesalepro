'use client';
import { useState } from 'react';
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPKR, formatDate, deliveryStatusClass, paymentStatusClass } from '@/lib/utils';
import type { Order } from '@/types';

interface Props { orders: Order[]; }

export default function OrdersClient({ orders }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(e => e === id ? null : id);

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#191c1e] tracking-tight">Order History</h1>
        <p className="text-[14px] text-[#3c4a42] mt-1">{orders.length} orders total</p>
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#6c7a71]">
          <ClipboardList className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-[16px] font-medium">No orders yet</p>
          <p className="text-[13px] mt-1">Orders will appear here once placed</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <div key={order.id} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => toggle(order.id)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[14px] text-[#191c1e] font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-[12px] text-[#6c7a71]">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="text-[12px] text-[#3c4a42] mt-0.5">
                    {order.retailer?.shop_name ?? order.retailer?.name ?? 'Unknown'} · {order.route_day}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${deliveryStatusClass(order.delivery_status)}`}>
                    {order.delivery_status}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${paymentStatusClass(order.payment_status)}`}>
                    {order.payment_status.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-[15px] text-[#006c49] tabular-nums ml-2">{formatPKR(order.total_amount)}</span>
                  {expanded === order.id ? <ChevronUp className="w-4 h-4 text-[#6c7a71]" /> : <ChevronDown className="w-4 h-4 text-[#6c7a71]" />}
                </div>
              </button>
              {expanded === order.id && order.items && order.items.length > 0 && (
                <div className="border-t border-[#bbcabf]/30 px-4 pb-4 pt-3">
                  <div className="flex flex-col gap-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-[13px]">
                        <span className="text-[#191c1e]">{item.product?.name ?? 'Product'}</span>
                        <div className="flex items-center gap-4 text-[#3c4a42]">
                          <span>{formatPKR(item.price_at_purchase)} × {item.quantity}</span>
                          <span className="font-semibold text-[#006c49] tabular-nums w-[80px] text-right">
                            {formatPKR(item.price_at_purchase * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-[12px] text-[#6c7a71] mt-2 pt-2 border-t border-[#bbcabf]/30">Note: {order.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
