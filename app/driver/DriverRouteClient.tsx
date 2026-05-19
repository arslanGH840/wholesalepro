'use client';
// app/driver/DriverRouteClient.tsx — Interactive driver route planner

import { useState, useTransition } from 'react';
import { Truck, MapPin, CheckCircle, Package, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateDeliveryStatus } from '@/app/actions/orderActions';
import { formatPKR, formatDate, deliveryStatusClass, paymentStatusClass, ROUTE_LABELS } from '@/lib/utils';
import type { Order, DeliveryStatus, RouteDay } from '@/types';

interface Props {
  orders: Order[];
  todayRoute: RouteDay | null;
}

const STATUS_FLOW: DeliveryStatus[] = ['PENDING', 'LOADED', 'DELIVERED'];

function nextStatus(current: DeliveryStatus): DeliveryStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

function StatusBadge({ status }: { status: string }) {
  const cls = deliveryStatusClass(status);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export default function DriverRouteClient({ orders, todayRoute }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const totalAmount = orders.reduce((s, o) => s + o.total_amount, 0);
  const delivered = orders.filter(o => o.delivery_status === 'DELIVERED').length;

  const handleAdvanceStatus = (orderId: string, currentStatus: DeliveryStatus) => {
    const next = nextStatus(currentStatus);
    if (!next) return;
    setPendingId(orderId);
    startTransition(async () => {
      const result = await updateDeliveryStatus(orderId, next);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setPendingId(null);
    });
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#191c1e] tracking-tight">
            Driver Route
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {todayRoute ? (
              <span className="text-[14px] text-[#3c4a42]">
                {ROUTE_LABELS[todayRoute]} — {orders.length} stops
              </span>
            ) : (
              <span className="text-[14px] text-[#3c4a42]">No route scheduled today (Sunday)</span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Stops', value: orders.length.toString(), icon: 'local_shipping' },
            { label: 'Delivered', value: delivered.toString(), icon: 'check_circle' },
            { label: 'Collection', value: formatPKR(totalAmount), icon: 'payments' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass-card rounded-xl p-3 flex flex-col gap-1">
              <span className="material-symbols-outlined text-[#006c49] text-[18px]">{icon}</span>
              <span className="font-bold text-[16px] text-[#191c1e] tabular-nums">{value}</span>
              <span className="text-[11px] text-[#3c4a42] uppercase tracking-wider font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {orders.length > 0 && (
        <div className="mb-6 glass-card rounded-xl p-4">
          <div className="flex justify-between text-[12px] text-[#3c4a42] mb-2">
            <span>Route Progress</span>
            <span className="font-semibold">{delivered} / {orders.length} delivered</span>
          </div>
          <div className="h-2 bg-[#e0e3e5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#006c49] rounded-full transition-all duration-500"
              style={{ width: orders.length ? `${(delivered / orders.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Order list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#6c7a71]">
          <Truck className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-[16px] font-medium">No orders for today&apos;s route</p>
          <p className="text-[13px] mt-1">Check back after retailers place their orders</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order, idx) => {
            const isExpanded = expandedId === order.id;
            const isLoading = pendingId === order.id && isPending;
            const next = order.delivery_status !== 'CANCELLED' ? nextStatus(order.delivery_status) : null;

            return (
              <div key={order.id} className="glass-card rounded-xl overflow-hidden">
                {/* Main row */}
                <div className="p-4 flex items-center gap-4">
                  {/* Stop number */}
                  <div className="w-9 h-9 rounded-full bg-[#006c49] text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                    {idx + 1}
                  </div>

                  {/* Retailer info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-[#191c1e]">
                      {order.retailer?.shop_name ?? order.retailer?.name ?? 'Unknown'}
                    </p>
                    {order.retailer?.address && (
                      <p className="text-[12px] text-[#3c4a42] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {order.retailer.address}
                      </p>
                    )}
                    <p className="text-[12px] text-[#6c7a71] mt-0.5">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Amount */}
                  <div className="hidden md:block text-right shrink-0">
                    <p className="font-bold text-[15px] text-[#006c49] tabular-nums">{formatPKR(order.total_amount)}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${paymentStatusClass(order.payment_status)}`}>
                      {order.payment_status === 'KHATA_CREDIT' ? 'Khata' : order.payment_status}
                    </span>
                  </div>

                  {/* Delivery status badge */}
                  <StatusBadge status={order.delivery_status} />

                  {/* Advance button */}
                  {next && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, order.delivery_status)}
                      disabled={isLoading}
                      className="shrink-0 px-3 py-2 rounded-lg bg-[#006c49] text-white text-[12px] font-semibold flex items-center gap-1 disabled:opacity-60 active:scale-95 transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden md:inline">Mark {next.toLowerCase()}</span>
                    </button>
                  )}

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-8 h-8 rounded-full hover:bg-[#eceef0] flex items-center justify-center transition-colors shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded order items */}
                {isExpanded && order.items && (
                  <div className="border-t border-[#bbcabf]/30 px-4 py-3 bg-[#f2f4f6]/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3c4a42] mb-2">
                      Order Items
                    </p>
                    <div className="flex flex-col gap-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-[#6c7a71]" />
                            <span className="text-[13px] text-[#191c1e]">{item.product?.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[13px]">
                            <span className="text-[#3c4a42]">× {item.quantity}</span>
                            <span className="font-semibold text-[#006c49] tabular-nums">
                              {formatPKR(item.price_at_purchase * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.retailer?.phone && (
                      <p className="mt-3 text-[12px] text-[#3c4a42]">
                        📞 {order.retailer.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
