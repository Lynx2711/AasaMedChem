'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ navLinks = [] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white h-[calc(100vh-3.5rem)] sticky top-14 py-6 flex flex-col justify-between shrink-0">
      <div className="flex flex-col gap-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center h-10 px-6 text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? 'border-zinc-950 text-zinc-950 bg-zinc-50/50'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/30'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
