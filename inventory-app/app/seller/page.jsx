'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import StatsCard from '@/components/StatsCard';

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        // Filter products to only show the ones owned by this seller
        const sellerId = session?.user?.id;
        const myProducts = data.filter((p) => String(p.seller_id) === String(sellerId));
        setProducts(myProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchProducts();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-zinc-500 text-sm font-medium animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-md text-sm">
        Error: {error}
      </div>
    );
  }

  const productCategories = new Set(products.map((p) => p.category).filter(Boolean));
  const outOfStockProducts = products.filter((p) => parseFloat(p.quantity) === 0).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">Seller Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your catalog and monitor inventory status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="My Products" value={products.length} description="Items in your active catalog" />
        <StatsCard title="Categories" value={productCategories.size} description="Unique product categories" />
        <StatsCard title="Out of Stock" value={outOfStockProducts} description="Items requiring restock" />
      </div>

      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5 border-b border-zinc-200">
          <h2 className="text-base font-semibold text-zinc-950">Active Catalog Summary</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">You haven't added any products yet. Go to My Products to add your first item.</div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="p-4 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-950">{p.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">SKU: {p.sku || 'N/A'} | {p.category || 'Uncategorized'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-950">{p.quantity} {p.unit_type === 'weight' ? 'g' : p.unit_type === 'volume' ? 'mL' : 'unit'}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Stock level</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
