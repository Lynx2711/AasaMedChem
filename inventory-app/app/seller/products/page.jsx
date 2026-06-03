'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatINR } from '@/lib/units';

export default function SellerProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unitType, setUnitType] = useState('count');
  const [quantity, setQuantity] = useState('');
  const [pricePerBaseUnit, setPricePerBaseUnit] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      // Filter for seller
      const sellerId = session?.user?.id;
      const myProducts = data.filter((p) => String(p.seller_id) === String(sellerId));
      setProducts(myProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchProducts();
    }
  }, [session]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setSku('');
    setCategory('');
    setUnitType('count');
    setQuantity('');
    setPricePerBaseUnit('');
    setSubmitError('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setDescription(product.description || '');
    setSku(product.sku || '');
    setCategory(product.category || '');
    setUnitType(product.unit_type || 'count');
    setQuantity(product.quantity || '');
    setPricePerBaseUnit(product.price_per_base_unit || '');
    setSubmitError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    const payload = {
      name,
      description,
      sku,
      category,
      unit_type: unitType,
      quantity: parseFloat(quantity),
      price_per_base_unit: parseFloat(pricePerBaseUnit),
    };

    if (editingProduct) {
      payload.is_active = editingProduct.is_active;
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      await fetchProducts();
      closeModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      await fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-zinc-500 text-sm font-medium animate-pulse">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">My Products</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and edit your products in the inventory catalog.</p>
        </div>
        <button
          onClick={openAddModal}
          className="h-10 px-4 bg-zinc-950 text-white rounded text-sm font-semibold tracking-wide hover:bg-zinc-800 transition-colors"
        >
          Add Product
        </button>
      </div>

      {error && (
        <div className="p-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-md text-sm">
          Error: {error}
        </div>
      )}

      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No products found. Add one to list it in the store.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Unit Type</th>
                  <th className="py-3.5 px-5 text-right">Stock (Base Unit)</th>
                  <th className="py-3.5 px-5 text-right">Price per Base</th>
                  <th className="py-3.5 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {products.map((product, idx) => (
                  <tr key={product.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-zinc-950">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-zinc-500 truncate max-w-xs mt-0.5">{product.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs">{product.sku || '-'}</td>
                    <td className="py-3.5 px-5 text-zinc-500">{product.category || '-'}</td>
                    <td className="py-3.5 px-5 text-zinc-500 capitalize">{product.unit_type}</td>
                    <td className="py-3.5 px-5 text-right text-zinc-950 font-medium">
                      {product.quantity}
                    </td>
                    <td className="py-3.5 px-5 text-right text-zinc-950 font-semibold">
                      {formatINR(product.price_per_base_unit)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded px-2.5 py-1 hover:bg-zinc-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 rounded px-2.5 py-1 hover:bg-rose-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 tracking-tight">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                {editingProduct ? 'Update product information and stock level.' : 'Insert a new item into the inventory.'}
              </p>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-700 font-medium">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
                  placeholder="e.g. Sodium Chloride"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 min-h-[60px]"
                  placeholder="Details, grade, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
                    placeholder="e.g. NACL-001"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
                    placeholder="e.g. Salts"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Unit Type</label>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    className="h-10 px-2 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 bg-white"
                  >
                    <option value="weight">Weight (g)</option>
                    <option value="volume">Volume (mL)</option>
                    <option value="count">Count (unit)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
                    placeholder="Quantity in base unit"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price / Base Unit</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={pricePerBaseUnit}
                    onChange={(e) => setPricePerBaseUnit(e.target.value)}
                    className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
                    placeholder="Price in INR"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="h-10 px-4 border border-zinc-200 rounded text-sm font-semibold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-4 bg-zinc-950 text-white rounded text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
