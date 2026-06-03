'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function BuyerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/login');
    } else if (session.user?.role !== 'buyer' && session.user?.role !== 'admin') {
      router.replace('/');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || (session.user?.role !== 'buyer' && session.user?.role !== 'admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-zinc-500 text-sm font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  const navLinks = [
    { href: '/buyer/browse', label: 'Browse Products' },
    { href: '/buyer/orders', label: 'My Orders' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar navLinks={navLinks} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
