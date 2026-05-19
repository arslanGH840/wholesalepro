'use client';
// components/ProductGrid.tsx — Interactive product grid with category filter

import { useState } from 'react';
import { Plus, Minus, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { formatPKR } from '@/lib/utils';

interface Props {
  products: Product[];
  categories: string[];
}

export default function ProductGrid({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const { addItem, removeItem, getItemQty } = useCart();

  const allCats = ['All', ...categories];

  const filtered = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      {/* Mobile search */}
      <div className="relative mb-4 md:hidden">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4a42] text-[20px]">search</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-[44px] pl-10 pr-4 bg-white rounded-full text-[14px] border border-[#bbcabf]/50 focus:outline-none focus:ring-2 focus:ring-[#006c49]/30"
          placeholder="Search products..."
        />
      </div>

      {/* Category chips */}
      <div className="mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 w-max pb-1">
          {allCats.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-[40px] px-5 rounded-full text-[12px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200
                ${activeCategory === cat
                  ? 'bg-[#006c49] text-white shadow-sm'
                  : 'bg-white/80 text-[#3c4a42] border border-[#bbcabf]/50 hover:bg-[#e0e3e5]/60'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#3c4a42]">
          <Package className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-[15px]">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(product => {
            const qty = getItemQty(product.id);
            const outOfStock = product.stock_qty === 0;

            return (
              <div
                key={product.id}
                className="glass-card rounded-xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-md"
              >
                {/* Product icon / placeholder */}
                <div className="w-full h-[100px] rounded-lg bg-[#eceef0] flex items-center justify-center">
                  <Package className="w-10 h-10 text-[#6c7a71]" />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1 flex-1">
                  <span className="font-semibold text-[14px] text-[#191c1e] leading-tight line-clamp-2">
                    {product.name}
                  </span>
                  <span className="text-[11px] text-[#3c4a42] uppercase tracking-wider font-semibold">
                    {product.category}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[15px] font-bold text-[#006c49]">
                      {formatPKR(product.wholesale_price)}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      outOfStock
                        ? 'bg-red-100 text-red-700'
                        : product.stock_qty < 10
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {outOfStock ? 'Out' : `${product.stock_qty} left`}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6c7a71]">Pack: {product.pack_size} units</div>
                </div>

                {/* Cart controls */}
                {outOfStock ? (
                  <button disabled className="w-full h-[40px] rounded-lg bg-[#e0e3e5] text-[#6c7a71] text-[13px] font-semibold cursor-not-allowed">
                    Out of Stock
                  </button>
                ) : qty === 0 ? (
                  <button
                    onClick={() => addItem(product)}
                    className="w-full h-[40px] rounded-lg bg-[#006c49] text-white text-[13px] font-semibold active:scale-[0.97] transition-transform duration-150 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="w-10 h-10 rounded-lg bg-[#eceef0] text-[#191c1e] flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-[16px] text-[#191c1e] tabular-nums">
                      {qty}
                    </span>
                    <button
                      onClick={() => addItem(product)}
                      disabled={qty >= product.stock_qty}
                      className="w-10 h-10 rounded-lg bg-[#006c49] text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
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
