'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { formatINR } from '@/lib/units';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-zinc-500 text-sm font-medium animate-pulse">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">Orders</h1>
        <p className="text-sm text-zinc-500 mt-1">Review customer orders, track payments, and update fulfillment status.</p>
      </div>

      {error && (
        <div className="p-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-md text-sm">
          Error: {error}
        </div>
      )}

      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No orders found in the system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Buyer Name</th>
                  <th className="py-3.5 px-5">Buyer Email</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Total</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orders.map((order, idx) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      <tr className={idx % 2 === 0 ? 'bg-white hover:bg-zinc-50/50' : 'bg-zinc-50/30 hover:bg-zinc-50/50'}>
                        <td className="py-4 px-5 font-mono text-xs">#{order.id}</td>
                        <td className="py-4 px-5 text-zinc-950 font-medium">{order.buyer_name}</td>
                        <td className="py-4 px-5 text-zinc-500">{order.buyer_email}</td>
                        <td className="py-4 px-5 text-zinc-500">
                          {new Date(order.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-4 px-5 text-right text-zinc-950 font-semibold">
                          {formatINR(order.total_amount)}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded px-2.5 py-1 hover:bg-zinc-50 transition-colors"
                          >
                            {isExpanded ? 'Hide' : 'Expand'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-zinc-50/40">
                          <td colSpan="7" className="p-6 border-t border-zinc-200">
                            <div className="flex flex-col gap-4">
                              <div>
                                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order Notes</h3>
                                <p className="text-sm text-zinc-700 mt-1">{order.notes || 'No notes provided.'}</p>
                              </div>

                              <div className="border border-zinc-200 rounded overflow-hidden bg-white">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                                      <th className="py-2.5 px-4">Product Name</th>
                                      <th className="py-2.5 px-4 text-right">Ordered Qty</th>
                                      <th className="py-2.5 px-4 text-right">Qty (Base Unit)</th>
                                      <th className="py-2.5 px-4 text-right">Price per Base</th>
                                      <th className="py-2.5 px-4 text-right font-bold">Line Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-100">
                                    {order.items?.map((item) => (
                                      <tr key={item.id} className="hover:bg-zinc-50/30">
                                        <td className="py-2.5 px-4 text-zinc-950 font-medium">{item.product_name}</td>
                                        <td className="py-2.5 px-4 text-right text-zinc-700">
                                          {item.ordered_quantity} <span className="text-zinc-400 font-medium">{item.ordered_unit}</span>
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-zinc-700">
                                          {item.quantity_in_base} <span className="text-zinc-400 font-medium">
                                            {item.unit_type === 'weight' ? 'g' : item.unit_type === 'volume' ? 'mL' : 'unit'}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-zinc-700">
                                          {formatINR(item.unit_price_at_order)}
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-zinc-950 font-semibold">
                                          {formatINR(item.line_total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex items-center justify-between border-t border-zinc-200/80 pt-4 mt-2">
                                <span className="text-xs text-zinc-500 font-medium">Update Order Status:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                                    disabled={updatingId !== null || order.status === 'confirmed'}
                                    className="text-xs font-semibold px-3 py-1.5 rounded border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 disabled:opacity-50 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(order.id, 'fulfilled')}
                                    disabled={updatingId !== null || order.status === 'fulfilled'}
                                    className="text-xs font-semibold px-3 py-1.5 rounded border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100/50 disabled:opacity-50 transition-colors"
                                  >
                                    Fulfill
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                    disabled={updatingId !== null || order.status === 'rejected'}
                                    className="text-xs font-semibold px-3 py-1.5 rounded border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100/50 disabled:opacity-50 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// React is not imported explicitly, let's make sure it is available or we use standard Fragments
import React from 'react';
