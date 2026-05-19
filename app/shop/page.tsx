// app/shop/page.tsx — Server Component: fetches products and passes to client grid

import { getSupabaseServerClient } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/types';

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getProductsAndCategories(): Promise<{
  products: Product[];
  categories: string[];
}> {
  const sb = getSupabaseServerClient();

  const { data, error } = await sb
    .from('products')
    .select('*')
    .order('category')
    .order('name');

  if (error || !data) {
    console.error('Failed to fetch products:', error);
    return { products: [], categories: [] };
  }

  const categories = Array.from(new Set(data.map((p: Product) => p.category))).sort();
  return { products: data as Product[], categories };
}

export default async function ShopPage() {
  const { products, categories } = await getProductsAndCategories();

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#191c1e] tracking-tight leading-tight">
          Inventory
        </h1>
        <p className="text-[14px] text-[#3c4a42] mt-1">
          {products.length} products · Select items to add to your order
        </p>
      </div>

      <ProductGrid products={products} categories={categories} />
    </div>
  );
}
