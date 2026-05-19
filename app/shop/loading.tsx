// app/shop/loading.tsx — Skeleton UI while shop page loads

import { ProductGridSkeleton } from '@/components/Skeletons';

export default function ShopLoading() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
      {/* Header skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-9 bg-[#e0e3e5] rounded-full w-48 mb-2" />
        <div className="h-4 bg-[#e0e3e5] rounded-full w-64" />
      </div>

      {/* Category chips skeleton */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-[#e0e3e5] animate-pulse" />
        ))}
      </div>

      <ProductGridSkeleton />
    </div>
  );
}
