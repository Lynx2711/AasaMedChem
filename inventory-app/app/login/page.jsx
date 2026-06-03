'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [landingRole, setLandingRole] = useState('buyer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created successfully! Please sign in.');
      const regEmail = searchParams.get('email');
      const regRole = searchParams.get('role');
      if (regEmail) setEmail(regEmail);
      if (regRole) setLandingRole(regRole);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.replace('/' + landingRole);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm border border-zinc-200 rounded-lg p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Sign In</h1>
        <p className="text-sm text-zinc-500 mt-1">Access the Aasa MedChem Inventory Portal</p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="landing-role" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Landing Dashboard
          </label>
          <select
            id="landing-role"
            disabled={loading}
            value={landingRole}
            onChange={(e) => setLandingRole(e.target.value)}
            className="h-10 px-2 border border-zinc-200 rounded text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 bg-white disabled:opacity-50"
          >
            <option value="admin">Admin Dashboard</option>
            <option value="seller">Seller Dashboard</option>
            <option value="buyer">Buyer Dashboard</option>
          </select>
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
            placeholder="e.g. admin@test.com"
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
            className="h-10 px-3 border border-zinc-200 rounded text-sm text-zinc-950 placeholder-zinc-400 bg-white focus:outline-none focus:border-zinc-950 disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-10 mt-2 bg-zinc-950 text-white rounded text-sm font-semibold tracking-wide hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-100 pt-4 text-center">
        <p className="text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-zinc-950 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <Suspense fallback={
        <div className="text-zinc-500 text-sm font-medium animate-pulse">Loading sign in...</div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
