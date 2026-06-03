'use client';

import { useState, useEffect } from 'react';
import { formatINR, calcLineTotal, UNITS_FOR_TYPE, TO_BASE } from '@/lib/units';

export default function BuyerBrowsePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  // Cart state: array of { product, quantity: number, unit: string }
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  const fetchProducts = async (q = '', cat = '') => {
    try {
      const url = `/api/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search, category);
  }, [search, category]);

  const addToCart = (product) => {
    setOrderSuccess(false);
    setOrderError('');
    
    // Check if product already in cart
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    
    if (existingIndex > -1) {
      // Product exists, increment quantity by 1 of its default display unit
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      // Add new item with default unit
      const defaultUnit = UNITS_FOR_TYPE[product.unit_type][0];
      setCart([...cart, { product, quantity: 1, unit: defaultUnit }]);
    }
  };

  const updateCartQty = (idx, qtyVal) => {
    const val = parseFloat(qtyVal);
    const newCart = [...cart];
    newCart[idx].quantity = isNaN(val) ? 0 : val;
    setCart(newCart);
  };

  const updateCartUnit = (idx, unitVal) => {
    const newCart = [...cart];
    newCart[idx].unit = unitVal;
    setCart(newCart);
  };

  const removeFromCart = (idx) => {
    const newCart = [...cart];
    newCart.splice(idx, 1);
    setCart(newCart);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    setOrdering(true);
    setOrderError('');
    setOrderSuccess(false);

    const payload = {
      notes,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit: item.unit,
      })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      setCart([]);
      setNotes('');
      setOrderSuccess(true);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setOrdering(false);
    }
  };

  // Get unique categories from products for filter select (fallback to standard ones if empty)
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  // Calculate cart display total
  const cartTotal = cart.reduce((sum, item) => {
    return sum + calcLineTotal(item.quantity, item.unit, item.product.price_per_base_unit);
  }, 0);

  return (
    <div className="flex gap-8 relative min-h-[calc(100vh-8rem)]">
      {/* Products Catalog - Left Side */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">Browse Products</h1>
          <p className="text-sm text-zinc-500 mt-1">Search, compare, and order chemical stocks and equipment.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, SKU, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 bg-white min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-zinc-500 text-sm font-medium animate-pulse">Loading catalog...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center border border-zinc-200 border-dashed rounded-lg text-zinc-500 text-sm">
            No products match your search/filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => {
              // Convert base unit price to default large display units (kg/L/unit) for initial showcase
              let displayPriceLabel = '';
              if (product.unit_type === 'weight') {
                const kgPrice = parseFloat(product.price_per_base_unit) * TO_BASE['kg'];
                displayPriceLabel = `${formatINR(kgPrice)} / kg`;
              } else if (product.unit_type === 'volume') {
                const lPrice = parseFloat(product.price_per_base_unit) * TO_BASE['L'];
                displayPriceLabel = `${formatINR(lPrice)} / L`;
              } else {
                displayPriceLabel = `${formatINR(product.price_per_base_unit)} / unit`;
              }

              return (
                <div key={product.id} className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{product.category || 'Uncategorized'}</span>
                    <h3 className="text-base font-semibold text-zinc-950 mt-1">{product.name}</h3>
                    {product.sku && (
                      <span className="text-xs font-mono text-zinc-500">SKU: {product.sku}</span>
                    )}
                    <p className="text-xs text-zinc-600 line-clamp-2 mt-2 leading-relaxed">
                      {product.description || 'No description available.'}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-950">{displayPriceLabel}</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                        Stock: {product.quantity} {product.unit_type === 'weight' ? 'g' : product.unit_type === 'volume' ? 'mL' : 'unit'}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={parseFloat(product.quantity) <= 0}
                      className="text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 px-3.5 py-2 rounded transition-colors"
                    >
                      {parseFloat(product.quantity) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar - Right Side */}
      <div className="w-96 border-l border-zinc-200 bg-white h-[calc(100vh-7.5rem)] sticky top-20 pl-8 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-6 overflow-y-auto flex-1 pr-2">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-base font-semibold text-zinc-950">Shopping Cart</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Review items before placing order.</p>
          </div>

          {orderSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-700 font-medium">
              Order placed successfully!
            </div>
          )}

          {orderError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-700 font-medium">
              {orderError}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-sm">
              Your cart is empty. Add items from the catalog.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item, idx) => {
                const linePrice = calcLineTotal(item.quantity, item.unit, item.product.price_per_base_unit);
                const allowedUnits = UNITS_FOR_TYPE[item.product.unit_type];

                return (
                  <div key={`${item.product.id}-${idx}`} className="p-3.5 border border-zinc-200 rounded-lg flex flex-col gap-3 relative bg-white">
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="absolute top-2 right-2 text-zinc-400 hover:text-rose-600 font-bold text-xs"
                      title="Remove from cart"
                    >
                      ✕
                    </button>

                    <div className="pr-4">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{item.product.category}</p>
                      <p className="text-sm font-semibold text-zinc-900 mt-0.5">{item.product.name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Quantity</span>
                        <input
                          type="number"
                          step="any"
                          min="0.0001"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => updateCartQty(idx, e.target.value)}
                          className="h-8 px-2 border border-zinc-200 rounded text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 w-full"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5 w-24">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Unit</span>
                        <select
                          value={item.unit}
                          onChange={(e) => updateCartUnit(idx, e.target.value)}
                          className="h-8 px-2 border border-zinc-200 rounded text-xs text-zinc-900 bg-white focus:outline-none focus:border-zinc-950"
                        >
                          {allowedUnits.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 mt-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Display</span>
                      <span className="text-sm font-bold text-zinc-950">{formatINR(linePrice)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <form onSubmit={handlePlaceOrder} className="border-t border-zinc-200 pt-5 mt-4 flex flex-col gap-4 bg-white">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Order Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shipping instructions or custom specifications..."
                className="p-2 border border-zinc-200 rounded text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 min-h-[50px]"
              />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Amount</span>
              <span className="text-lg font-bold text-zinc-950">{formatINR(cartTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={ordering}
              className="w-full h-10 bg-zinc-950 text-white rounded text-sm font-semibold tracking-wide hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {ordering ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
