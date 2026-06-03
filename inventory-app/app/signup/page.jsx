'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      // Redirect to login page with success status
      router.replace(`/login?registered=true&email=${encodeURIComponent(email)}&role=${role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm border border-zinc-200 rounded-lg p-6 bg-white">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-zinc-500 mt-1">Register as a Buyer or Seller on Aasa MedChem</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 placeholder-zinc-400 bg-white focus:outline-none focus:border-zinc-950 disabled:opacity-50"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 placeholder-zinc-400 bg-white focus:outline-none focus:border-zinc-950 disabled:opacity-50"
              placeholder="e.g. buyer@test.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-900 placeholder-zinc-400 bg-white focus:outline-none focus:border-zinc-950 disabled:opacity-50"
              placeholder="Min. 6 characters"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Register As
            </label>
            <select
              id="role"
              disabled={loading}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 px-2 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 bg-white disabled:opacity-50"
            >
              <option value="buyer">Buyer Account</option>
              <option value="seller">Seller Account</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 mt-2 bg-zinc-950 text-white rounded text-sm font-semibold tracking-wide hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center animate-none"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-100 pt-4 text-center">
          <p className="text-xs text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-zinc-950 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
