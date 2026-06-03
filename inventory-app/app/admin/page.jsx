'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { formatINR } from '@/lib/units';
import Link from 'next/link';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, ordRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);

        if (!prodRes.ok || !ordRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const prodData = await prodRes.json();
        const ordData = await ordRes.json();

        setProducts(prodData);
        setOrders(ordData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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

  // Calculate statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pending').length;
  const totalOrderValue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of system inventory and sales activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Products" value={totalProducts} description="Active catalog items" />
        <StatsCard title="Total Orders" value={totalOrders} description="Lifetime orders placed" />
        <StatsCard title="Pending Orders" value={pendingOrders} description="Awaiting review/action" />
        <StatsCard title="Total Revenue" value={formatINR(totalOrderValue)} description="Gross sales value" />
      </div>

      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 uppercase tracking-wider">
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No orders found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Buyer</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Total</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {recentOrders.map((order, idx) => (
                  <tr key={order.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}>
                    <td className="py-3.5 px-5 font-mono text-xs">#{order.id}</td>
                    <td className="py-3.5 px-5 text-zinc-950 font-medium">{order.buyer_name}</td>
                    <td className="py-3.5 px-5 text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right text-zinc-950 font-semibold">
                      {formatINR(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
