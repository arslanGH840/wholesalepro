import { LedgerRowSkeleton, StatCardSkeleton } from '@/components/Skeletons';

export default function KhataLoading() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-pulse">
        <div>
          <div className="h-9 bg-[#e0e3e5] rounded-full w-48 mb-2" />
          <div className="h-4 bg-[#e0e3e5] rounded-full w-64" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => <LedgerRowSkeleton key={i} />)}
      </div>
    </div>
  );
}
