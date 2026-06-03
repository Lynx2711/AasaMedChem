import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Aasa MedChem Inventory App',
  description: 'Inventory Management App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={`${inter.className} text-zinc-900 antialiased min-h-screen flex flex-col`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
