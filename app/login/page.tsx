'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/shop';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
      setLoading(false);
      return;
    }
    toast.success('Welcome back!');
    router.push(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f7f9fb' }}>
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#006c49] flex items-center justify-center mb-3 shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-[#191c1e] tracking-tight">WholesalePro</h1>
          <p className="text-[14px] text-[#3c4a42] mt-1">Sign in to your account</p>
        </div>
        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#3c4a42]">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-[48px] px-4 rounded-xl border border-[#bbcabf]/50 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#3c4a42]">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-[48px] px-4 rounded-xl border border-[#bbcabf]/50 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30" />
            </div>
            <button type="submit" disabled={loading}
              className="h-[48px] mt-2 rounded-xl bg-[#006c49] text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-[12px] text-[#6c7a71] mt-4">Contact your administrator to get an account.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
