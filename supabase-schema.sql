-- ================================================================
-- WholesalePro — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── ENUMS ─────────────────────────────────────────────────────────────────────

create type user_role as enum ('ADMIN', 'RETAILER');
create type route_day as enum ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY');
create type payment_status as enum ('PAID','KHATA_CREDIT','PENDING');
create type delivery_status as enum ('PENDING','LOADED','DELIVERED','CANCELLED');

-- ─── USERS ─────────────────────────────────────────────────────────────────────

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text not null,
  role        user_role not null default 'RETAILER',
  route_day   route_day,          -- assigned delivery day (retailers only)
  shop_name   text,
  phone       text,
  address     text,
  created_at  timestamptz not null default now()
);

create index idx_users_role      on users(role);
create index idx_users_route_day on users(route_day);

-- ─── PRODUCTS ──────────────────────────────────────────────────────────────────

create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null,
  wholesale_price  numeric(10,2) not null check (wholesale_price >= 0),
  stock_qty        integer not null default 0 check (stock_qty >= 0),
  pack_size        integer not null default 1 check (pack_size > 0),
  image_url        text,
  created_at       timestamptz not null default now()
);

create index idx_products_category on products(category);
create index idx_products_stock    on products(stock_qty);

-- ─── ORDERS ────────────────────────────────────────────────────────────────────

create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  retailer_id      uuid not null references users(id) on delete restrict,
  route_day        route_day not null,
  total_amount     numeric(12,2) not null check (total_amount >= 0),
  payment_status   payment_status not null default 'PENDING',
  delivery_status  delivery_status not null default 'PENDING',
  notes            text,
  created_at       timestamptz not null default now()
);

create index idx_orders_retailer_id      on orders(retailer_id);
create index idx_orders_route_day        on orders(route_day);
create index idx_orders_delivery_status  on orders(delivery_status);
create index idx_orders_created_at       on orders(created_at desc);

-- ─── ORDER ITEMS ───────────────────────────────────────────────────────────────

create table if not exists order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references orders(id) on delete cascade,
  product_id         uuid not null references products(id) on delete restrict,
  quantity           integer not null check (quantity > 0),
  price_at_purchase  numeric(10,2) not null check (price_at_purchase >= 0)
);

create index idx_order_items_order_id   on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);

-- ─── LEDGER ────────────────────────────────────────────────────────────────────

create table if not exists ledger (
  id            uuid primary key default gen_random_uuid(),
  retailer_id   uuid unique not null references users(id) on delete cascade,
  balance_due   numeric(12,2) not null default 0 check (balance_due >= 0),
  last_updated  timestamptz not null default now()
);

create index idx_ledger_retailer_id  on ledger(retailer_id);
create index idx_ledger_balance_due  on ledger(balance_due desc);

-- ─── FUNCTION: decrement_stock ─────────────────────────────────────────────────
-- Called by Server Actions to safely reduce stock without going below 0

create or replace function decrement_stock(p_product_id uuid, p_qty integer)
returns void
language plpgsql
as $$
begin
  update products
  set stock_qty = greatest(0, stock_qty - p_qty)
  where id = p_product_id;
end;
$$;

-- ─── SEED DATA — Sample products ───────────────────────────────────────────────

insert into products (name, category, wholesale_price, stock_qty, pack_size) values
  ('Lays Classic Chips 30g', 'Snacks', 25, 240, 24),
  ('Kurkure Masala 28g', 'Snacks', 20, 360, 36),
  ('Pringles Original 150g', 'Snacks', 180, 48, 12),
  ('Candyland Éclairs', 'Candies', 80, 500, 100),
  ('Fruit Plus Mixed Candy', 'Candies', 60, 400, 80),
  ('Polo Mint Original', 'Candies', 15, 300, 50),
  ('7UP 250ml Can', 'Beverages', 60, 144, 24),
  ('Pepsi 500ml Bottle', 'Beverages', 75, 120, 24),
  ('Sting Energy 250ml', 'Beverages', 90, 96, 24),
  ('Sunsilk Shampoo 180ml', 'Personal Care', 120, 60, 12),
  ('Surf Excel 500g', 'Household', 150, 80, 10),
  ('Vim Dishwash Bar', 'Household', 35, 200, 20),
  ('Kolson Spaghetti 400g', 'Grocery', 95, 100, 10),
  ('National Salt 800g', 'Grocery', 45, 150, 12),
  ('Mitchells Jam 450g', 'Grocery', 140, 72, 12),
  ('Sooper Biscuits', 'Biscuits', 30, 480, 48),
  ('Oreo Original 154g', 'Biscuits', 85, 144, 24),
  ('Rio Biscuit', 'Biscuits', 25, 600, 60)
on conflict do nothing;

-- Sample retailer users
insert into users (id, email, name, role, route_day, shop_name, phone, address) values
  ('00000000-0000-0000-0000-000000000001', 'aslam@demo.com', 'Aslam Shah', 'RETAILER', 'MONDAY', 'Aslam General Store', '0300-1234567', 'Main Bazar, Rawalpindi'),
  ('00000000-0000-0000-0000-000000000002', 'farooq@demo.com', 'Farooq Ahmed', 'RETAILER', 'WEDNESDAY', 'Farooq Mart', '0312-9876543', 'Saddar, Rawalpindi'),
  ('00000000-0000-0000-0000-000000000003', 'nasreen@demo.com', 'Nasreen Bibi', 'RETAILER', 'THURSDAY', 'Nasreen Shop', '0333-5556666', 'Committee Chowk, Rawalpindi'),
  ('00000000-0000-0000-0000-000000000004', 'admin@demo.com', 'Admin Owner', 'ADMIN', null, null, '0321-0000000', null)
on conflict (email) do nothing;
