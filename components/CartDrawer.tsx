'use client';
// components/CartDrawer.tsx — Slide-over cart with order submission

import { useState, useTransition } from 'react';
import { X, Minus, Plus, ShoppingBag, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/app/actions/orderActions';
import { formatPKR } from '@/lib/utils';
import type { PaymentStatus } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Demo retailer ID — in production, get from session/auth
const DEMO_RETAILER_ID = '00000000-0000-0000-0000-000000000001';

export default function CartDrawer({ open, onClose }: Props) {
  const { cart, addItem, removeItem, updateQty, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentStatus>('PAID');
  const [isPending, startTransition] = useTransition();

  const handlePlaceOrder = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    startTransition(async () => {
      const result = await placeOrder({
        retailerId: DEMO_RETAILER_ID,
        items: cart.items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          priceAtPurchase: i.product.wholesale_price,
        })),
        totalAmount: cart.totalAmount,
        paymentStatus: paymentMethod,
      });

      if (result.success) {
        toast.success(result.message);
        clearCart();
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-[420px] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'rgba(247,249,251,0.97)', backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#bbcabf]/40">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#006c49]" />
            <span className="font-bold text-[17px] text-[#191c1e]">Cart</span>
            {cart.totalItems > 0 && (
              <span className="ml-1 w-6 h-6 bg-[#006c49] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {cart.totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-[12px] text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-[#eceef0] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6c7a71]">
              <ShoppingBag className="w-14 h-14 mb-3 opacity-30" />
              <p className="text-[15px] font-medium">Your cart is empty</p>
              <p className="text-[13px] mt-1">Add products from the shop</p>
            </div>
          ) : (
            cart.items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="glass-card rounded-xl p-3 flex items-center gap-3"
              >
                {/* Product color dot */}
                <div className="w-10 h-10 rounded-lg bg-[#eceef0] flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-[#6c7a71] uppercase">
                    {product.name.slice(0, 2)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] text-[#191c1e] truncate">{product.name}</p>
                  <p className="text-[12px] text-[#3c4a42]">
                    {formatPKR(product.wholesale_price)} × {quantity}
                  </p>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-[14px] text-[#006c49] tabular-nums">
                    {formatPKR(product.wholesale_price * quantity)}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-[#eceef0] flex items-center justify-center hover:bg-[#e0e3e5] transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-[13px] tabular-nums">{quantity}</span>
                  <button
                    onClick={() => addItem(product)}
                    disabled={quantity >= product.stock_qty}
                    className="w-7 h-7 rounded-lg bg-[#006c49] text-white flex items-center justify-center hover:bg-[#005236] transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — totals + payment + submit */}
        {cart.items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#bbcabf]/40 flex flex-col gap-4">
            {/* Order summary */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[13px] text-[#3c4a42]">
                <span>{cart.totalItems} items</span>
                <span className="tabular-nums">{formatPKR(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-[16px] text-[#191c1e]">
                <span>Total</span>
                <span className="tabular-nums text-[#006c49]">{formatPKR(cart.totalAmount)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#3c4a42]">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PAID', 'KHATA_CREDIT', 'PENDING'] as PaymentStatus[]).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 rounded-lg text-[11px] font-semibold transition-all duration-200 border
                      ${paymentMethod === method
                        ? 'bg-[#006c49] text-white border-[#006c49]'
                        : 'bg-white text-[#3c4a42] border-[#bbcabf]/60 hover:border-[#006c49]/40'
                      }`}
                  >
                    {method === 'PAID' ? 'Cash' : method === 'KHATA_CREDIT' ? 'Khata' : 'Pending'}
                  </button>
                ))}
              </div>
              {paymentMethod === 'KHATA_CREDIT' && (
                <p className="text-[11px] text-[#855300] bg-amber-50 rounded-lg px-3 py-2">
                  ⚠️ Amount will be added to retailer&apos;s Khata ledger balance.
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPending}
              className="w-full h-[48px] rounded-xl bg-[#006c49] text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order — {formatPKR(cart.totalAmount)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
