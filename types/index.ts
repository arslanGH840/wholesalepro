// ============================================================
// types/index.ts — Full TypeScript definitions for WholesalePro
// ============================================================

export type UserRole = 'ADMIN' | 'RETAILER';

export type RouteDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export type PaymentStatus = 'PAID' | 'KHATA_CREDIT' | 'PENDING';

export type DeliveryStatus = 'PENDING' | 'LOADED' | 'DELIVERED' | 'CANCELLED';

// ─── Database Row Types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  route_day?: RouteDay | null;  // assigned delivery route (RETAILER only)
  shop_name?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  wholesale_price: number;
  stock_qty: number;
  pack_size: number;      // e.g. 12 units per pack
  image_url?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  retailer_id: string;
  route_day: RouteDay;
  total_amount: number;
  payment_status: PaymentStatus;
  delivery_status: DeliveryStatus;
  notes?: string | null;
  created_at: string;
  // joined fields
  retailer?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  // joined
  product?: Product;
}

export interface Ledger {
  id: string;
  retailer_id: string;
  balance_due: number;
  last_updated: string;
  // joined
  retailer?: User;
}

// ─── Cart Types ────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

// ─── Server Action Response Types ─────────────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PlaceOrderPayload {
  retailerId: string;
  items: { productId: string; quantity: number; priceAtPurchase: number }[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}

// ─── UI / Page Prop Types ──────────────────────────────────────────────────────

export interface ProductGridProps {
  products: Product[];
  categories: string[];
}

export interface OrderCardProps {
  order: Order;
}

export interface LedgerRowProps {
  entry: Ledger;
}

export interface RouteStopProps {
  retailer: User;
  order?: Order;
}

// ─── Supabase Auth Session Type ───────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  shop_name?: string | null;
  route_day?: RouteDay | null;
}
