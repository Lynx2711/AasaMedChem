import "./globals.css";

export const metadata = {
  title: "Aasa MedChem Inventory App",
  description: "Inventory Management App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
