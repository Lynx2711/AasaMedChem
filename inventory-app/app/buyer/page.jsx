'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BuyerDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/buyer/browse');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-zinc-500 text-sm font-medium animate-pulse">Redirecting to browse...</div>
    </div>
  );
}
