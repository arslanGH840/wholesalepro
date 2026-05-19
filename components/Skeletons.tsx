// components/Skeletons.tsx — Reusable skeleton placeholders

export function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-3 animate-pulse">
      <div className="w-full h-[100px] rounded-lg bg-[#e0e3e5]" />
      <div className="h-4 bg-[#e0e3e5] rounded-full w-3/4" />
      <div className="h-3 bg-[#e0e3e5] rounded-full w-1/3" />
      <div className="flex justify-between">
        <div className="h-5 bg-[#e0e3e5] rounded-full w-1/3" />
        <div className="h-5 bg-[#e0e3e5] rounded-full w-1/4" />
      </div>
      <div className="h-10 bg-[#e0e3e5] rounded-lg" />
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#e0e3e5]" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-[#e0e3e5] rounded-full w-1/2" />
        <div className="h-3 bg-[#e0e3e5] rounded-full w-1/3" />
      </div>
      <div className="h-6 w-20 bg-[#e0e3e5] rounded-full" />
      <div className="h-6 w-16 bg-[#e0e3e5] rounded-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-2 animate-pulse">
      <div className="h-3 bg-[#e0e3e5] rounded-full w-1/2" />
      <div className="h-8 bg-[#e0e3e5] rounded-full w-2/3" />
    </div>
  );
}

export function LedgerRowSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#e0e3e5]" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-[#e0e3e5] rounded-full w-2/5" />
        <div className="h-3 bg-[#e0e3e5] rounded-full w-1/4" />
      </div>
      <div className="h-6 w-24 bg-[#e0e3e5] rounded-full" />
      <div className="h-9 w-20 bg-[#e0e3e5] rounded-lg" />
    </div>
  );
}
