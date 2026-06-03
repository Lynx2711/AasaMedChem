'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user?.role;
  let badgeStyle = '';

  if (role === 'admin') {
    badgeStyle = 'bg-zinc-950 text-white border border-transparent';
  } else if (role === 'seller') {
    badgeStyle = 'bg-zinc-100 text-zinc-800 border border-transparent';
  } else {
    // buyer
    badgeStyle = 'bg-white text-zinc-800 border border-zinc-200';
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold text-zinc-900 tracking-tight">
          Aasa MedChem
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700">{session.user?.name}</span>
          <span className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-full ${badgeStyle}`}>
            {role}
          </span>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
