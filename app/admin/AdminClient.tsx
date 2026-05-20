'use client';
import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Users, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPKR } from '@/lib/utils';
import { addProduct, updateProduct, deleteProduct, addRetailer } from './adminActions';
import type { Product, User, RouteDay } from '@/types';

const ROUTE_DAYS: RouteDay[] = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const CATEGORIES = ['Snacks','Candies','Beverages','Biscuits','Personal Care','Household','Grocery'];

interface Props { products: Product[]; retailers: User[]; }

const emptyProduct = { name:'', category:'Snacks', wholesale_price:'', stock_qty:'', pack_size:'1' };
const emptyRetailer = { name:'', email:'', shop_name:'', phone:'', address:'', route_day:'MONDAY' as RouteDay, password:'' };

export default function AdminClient({ products: initial, retailers: initialR }: Props) {
  const [tab, setTab] = useState<'products'|'retailers'>('products');
  const [products, setProducts] = useState(initial);
  const [retailers, setRetailers] = useState(initialR);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showRetailerForm, setShowRetailerForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [retailerForm, setRetailerForm] = useState(emptyRetailer);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string|null>(null);

  const openAddProduct = () => { setEditingProduct(null); setProductForm(emptyProduct); setShowProductForm(true); };
  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, category: p.category, wholesale_price: String(p.wholesale_price), stock_qty: String(p.stock_qty), pack_size: String(p.pack_size) });
    setShowProductForm(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.wholesale_price || !productForm.stock_qty) { toast.error('Please fill all required fields.'); return; }
    startTransition(async () => {
      const payload = { name: productForm.name.trim(), category: productForm.category, wholesale_price: parseFloat(productForm.wholesale_price), stock_qty: parseInt(productForm.stock_qty), pack_size: parseInt(productForm.pack_size) || 1 };
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, payload);
        if (res.success) { setProducts(ps => ps.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p)); toast.success('Product updated!'); setShowProductForm(false); }
        else toast.error(res.message);
      } else {
        const res = await addProduct(payload);
        if (res.success && res.data) { setProducts(ps => [...ps, res.data as Product]); toast.success('Product added!'); setShowProductForm(false); }
        else toast.error(res.message);
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) { setProducts(ps => ps.filter(p => p.id !== id)); toast.success('Deleted.'); }
      else toast.error(res.message);
      setDeletingId(null);
    });
  };

  const handleSaveRetailer = () => {
    if (!retailerForm.name || !retailerForm.email || !retailerForm.password) { toast.error('Name, email and password are required.'); return; }
    startTransition(async () => {
      const res = await addRetailer(retailerForm);
      if (res.success && res.data) { setRetailers(rs => [...rs, res.data as User]); toast.success('Retailer added!'); setShowRetailerForm(false); setRetailerForm(emptyRetailer); }
      else toast.error(res.message);
    });
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#191c1e] tracking-tight">Admin Panel</h1>
          <p className="text-[14px] text-[#3c4a42] mt-1">Manage products and retailers</p>
        </div>
        <button onClick={() => tab === 'products' ? openAddProduct() : setShowRetailerForm(true)}
          className="flex items-center gap-2 h-[44px] px-5 rounded-xl bg-[#006c49] text-white font-semibold text-[14px] active:scale-95 transition-all">
          <Plus className="w-4 h-4" />Add {tab === 'products' ? 'Product' : 'Retailer'}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['products','retailers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 h-[40px] px-5 rounded-full text-[13px] font-semibold capitalize transition-all
              ${tab === t ? 'bg-[#006c49] text-white' : 'bg-white border border-[#bbcabf]/50 text-[#3c4a42]'}`}>
            {t === 'products' ? <Package className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            {t} {t === 'products' ? `(${products.length})` : `(${retailers.length})`}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="flex flex-col gap-3">
          {products.map(p => (
            <div key={p.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[14px] text-[#191c1e]">{p.name}</span>
                  <span className="text-[11px] bg-[#eceef0] text-[#3c4a42] px-2 py-0.5 rounded-full font-semibold uppercase">{p.category}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[13px] font-bold text-[#006c49]">{formatPKR(p.wholesale_price)}</span>
                  <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${p.stock_qty === 0 ? 'bg-red-100 text-red-700' : p.stock_qty < 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {p.stock_qty} in stock
                  </span>
                  <span className="text-[12px] text-[#6c7a71]">Pack: {p.pack_size}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEditProduct(p)} className="w-9 h-9 rounded-lg border border-[#bbcabf]/50 flex items-center justify-center hover:bg-[#eceef0] transition-colors">
                  <Pencil className="w-4 h-4 text-[#3c4a42]" />
                </button>
                <button onClick={() => handleDeleteProduct(p.id)} disabled={deletingId === p.id}
                  className="w-9 h-9 rounded-lg border border-red-200 flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50">
                  {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[#6c7a71]">
              <Package className="w-12 h-12 mb-3 opacity-30" /><p>No products yet.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'retailers' && (
        <div className="flex flex-col gap-3">
          {retailers.map(r => (
            <div key={r.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#006c49]/10 flex items-center justify-center font-bold text-[#006c49] shrink-0">
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[#191c1e]">{r.shop_name ?? r.name}</div>
                <div className="text-[12px] text-[#3c4a42]">{r.phone ?? r.email} · Route: {r.route_day ?? 'Not set'}</div>
                {r.address && <div className="text-[12px] text-[#6c7a71] truncate">{r.address}</div>}
              </div>
            </div>
          ))}
          {retailers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[#6c7a71]">
              <Users className="w-12 h-12 mb-3 opacity-30" /><p>No retailers yet.</p>
            </div>
          )}
        </div>
      )}

      {showProductForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-[480px] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[18px] text-[#191c1e]">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowProductForm(false)} className="w-8 h-8 rounded-full hover:bg-[#eceef0] flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {[
              { label:'Product Name *', key:'name', type:'text', placeholder:'e.g. Lays Classic 30g' },
              { label:'Wholesale Price (Rs) *', key:'wholesale_price', type:'number', placeholder:'25' },
              { label:'Stock Quantity *', key:'stock_qty', type:'number', placeholder:'100' },
              { label:'Pack Size (units)', key:'pack_size', type:'number', placeholder:'24' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#3c4a42]">{label}</label>
                <input type={type} value={productForm[key as keyof typeof productForm]}
                  onChange={e => setProductForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="h-[44px] px-4 rounded-xl border border-[#bbcabf]/50 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#3c4a42]">Category</label>
              <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                className="h-[44px] px-4 rounded-xl border border-[#bbcabf]/50 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30 bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowProductForm(false)} className="flex-1 h-[48px] rounded-xl border border-[#bbcabf]/50 text-[#3c4a42] font-semibold text-[14px]">Cancel</button>
              <button onClick={handleSaveProduct} disabled={isPending}
                className="flex-1 h-[48px] rounded-xl bg-[#006c49] text-white font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-70">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRetailerForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-[480px] rounded-2xl p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[18px] text-[#191c1e]">Add Retailer</h2>
              <button onClick={() => setShowRetailerForm(false)} className="w-8 h-8 rounded-full hover:bg-[#eceef0] flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {[
              { label:'Full Name *', key:'name', type:'text', placeholder:'e.g. Aslam Shah' },
              { label:'Email *', key:'email', type:'email', placeholder:'aslam@example.com' },
              { label:'Password *', key:'password', type:'password', placeholder:'min 6 characters' },
              { label:'Shop Name', key:'shop_name', type:'text', placeholder:'Aslam General Store' },
              { label:'Phone', key:'phone', type:'text', placeholder:'0300-1234567' },
              { label:'Address', key:'address', type:'text', placeholder:'Main Bazar, Rawalpindi' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#3c4a42]">{label}</label>
                <input type={type} value={retailerForm[key as keyof typeof retailerForm]}
                  onChange={e => setRetailerForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="h-[44px] px-4 rounded-xl border border-[#bbcabf]/50 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#3c4a42]">Delivery Route Day</label>
              <select value={retailerForm.route_day} onChange={e => setRetailerForm(f => ({ ...f, route_day: e.target.value as RouteDay }))}
                className="h-[44px] px-4 rounded-xl border border-[#bbcabf]/50 text-[14px] focus:outline-none bg-white focus:ring-2 focus:ring-[#006c49]/30">
                {ROUTE_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowRetailerForm(false)} className="flex-1 h-[48px] rounded-xl border border-[#bbcabf]/50 text-[#3c4a42] font-semibold text-[14px]">Cancel</button>
              <button onClick={handleSaveRetailer} disabled={isPending}
                className="flex-1 h-[48px] rounded-xl bg-[#006c49] text-white font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-70">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Add Retailer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
