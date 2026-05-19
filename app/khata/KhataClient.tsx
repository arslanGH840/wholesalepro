'use client';
// app/khata/KhataClient.tsx — Digital Khata ledger with payment settlement

import { useState, useTransition } from 'react';
import { BookOpen, TrendingUp, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { settleKhataBalance } from '@/app/actions/orderActions';
import { formatPKR, formatDate } from '@/lib/utils';
import type { Ledger } from '@/types';

interface Props {
  entries: Ledger[];
  totalOutstanding: number;
}

export default function KhataClient({ entries, totalOutstanding }: Props) {
  const [settleId, setSettleId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [isPending, startTransition] = useTransition();
  const [pendingRetailerId, setPendingRetailerId] = useState<string | null>(null);

  const handleSettle = (retailerId: string, fullBalance: number) => {
    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (amount > fullBalance) {
      toast.error(`Amount cannot exceed outstanding balance of ${formatPKR(fullBalance)}.`);
      return;
    }

    setPendingRetailerId(retailerId);
    startTransition(async () => {
      const result = await settleKhataBalance(retailerId, amount);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setSettleId(null);
      setSettleAmount('');
      setPendingRetailerId(null);
    });
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#191c1e] tracking-tight">
            Khata Ledger
          </h1>
          <p className="text-[14px] text-[#3c4a42] mt-1">
            Digital credit tracking for all retail partners
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#3c4a42]">Total Outstanding</span>
            <span className="text-[22px] font-bold text-red-600 tabular-nums">{formatPKR(totalOutstanding)}</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#3c4a42]">Active Accounts</span>
            <span className="text-[22px] font-bold text-[#191c1e] tabular-nums">
              {entries.filter(e => e.balance_due > 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Ledger table */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#6c7a71]">
          <BookOpen className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-[16px] font-medium">No Khata entries yet</p>
          <p className="text-[13px] mt-1">Khata balances appear when retailers order on credit</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(entry => {
            const isSettling = settleId === entry.retailer_id;
            const isLoading = pendingRetailerId === entry.retailer_id && isPending;
            const cleared = entry.balance_due === 0;

            return (
              <div
                key={entry.id}
                className={`glass-card rounded-xl p-4 flex flex-col gap-3 transition-all ${cleared ? 'opacity-60' : ''}`}
              >
                {/* Main row */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-[16px] shrink-0 ${
                    cleared ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {entry.retailer?.name?.charAt(0)?.toUpperCase() ?? 'R'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-[#191c1e]">
                      {entry.retailer?.shop_name ?? entry.retailer?.name ?? 'Unknown'}
                    </p>
                    <p className="text-[12px] text-[#3c4a42]">
                      {entry.retailer?.phone ?? 'No phone'} · Last updated: {formatDate(entry.last_updated)}
                    </p>
                  </div>

                  {/* Balance */}
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-[18px] tabular-nums ${cleared ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatPKR(entry.balance_due)}
                    </p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      cleared ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {cleared ? 'Cleared' : 'Outstanding'}
                    </span>
                  </div>

                  {/* Settle button */}
                  {!cleared && (
                    <button
                      onClick={() => {
                        setSettleId(isSettling ? null : entry.retailer_id);
                        setSettleAmount('');
                      }}
                      className="shrink-0 px-3 py-2 rounded-lg bg-[#006c49] text-white text-[12px] font-semibold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Settle
                    </button>
                  )}
                </div>

                {/* Settlement input — expands inline */}
                {isSettling && entry.retailer_id && (
                  <div className="border-t border-[#bbcabf]/30 pt-3 flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4a42] text-[13px] font-semibold">Rs</span>
                      <input
                        type="number"
                        value={settleAmount}
                        onChange={e => setSettleAmount(e.target.value)}
                        placeholder={entry.balance_due.toString()}
                        className="w-full h-[44px] pl-9 pr-4 bg-white rounded-lg border border-[#bbcabf]/60 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30 tabular-nums"
                      />
                    </div>
                    <button
                      onClick={() => handleSettle(entry.retailer_id, entry.balance_due)}
                      disabled={isLoading}
                      className="h-[44px] px-4 rounded-lg bg-[#006c49] text-white font-semibold text-[13px] flex items-center gap-1.5 disabled:opacity-60 active:scale-95 transition-all"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Record
                    </button>
                    <button
                      onClick={() => setSettleId(null)}
                      className="h-[44px] w-[44px] rounded-lg border border-[#bbcabf]/60 flex items-center justify-center hover:bg-[#eceef0] transition-colors"
                    >
                      <X className="w-4 h-4 text-[#3c4a42]" />
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
