'use client';
// context/CartContext.tsx — Global cart state via React Context + useReducer

import { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import type { CartState, CartAction, CartItem, Product } from '@/types';

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map(i =>
          i.product.id === action.product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newItems = [...state.items, { product: action.product, quantity: 1 }];
      }
      return computeTotals({ ...state, items: newItems });
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(i => i.product.id !== action.productId);
      return computeTotals({ ...state, items: newItems });
    }
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        const newItems = state.items.filter(i => i.product.id !== action.productId);
        return computeTotals({ ...state, items: newItems });
      }
      const newItems = state.items.map(i =>
        i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
      );
      return computeTotals({ ...state, items: newItems });
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

function computeTotals(state: CartState): CartState {
  const totalAmount = state.items.reduce(
    (sum, i) => sum + i.product.wholesale_price * i.quantity, 0
  );
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  return { ...state, totalAmount, totalItems };
}

const initialState: CartState = { items: [], totalAmount: 0, totalItems: 0 };

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  cart: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQty: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    addItem: (product: Product) => dispatch({ type: 'ADD_ITEM', product }),
    removeItem: (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }),
    updateQty: (productId: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QTY', productId, quantity }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    getItemQty: (productId: string) =>
      cart.items.find(i => i.product.id === productId)?.quantity ?? 0,
  }), [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
