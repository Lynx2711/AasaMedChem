'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/login');
    } else {
      const role = session.user?.role;
      if (role === 'admin') {
        router.replace('/admin');
      } else if (role === 'seller') {
        router.replace('/seller');
      } else if (role === 'buyer') {
        router.replace('/buyer');
      } else {
        router.replace('/login');
      }
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-zinc-500 text-sm font-medium animate-pulse">Loading...</div>
    </div>
  );
}
