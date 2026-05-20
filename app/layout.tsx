import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import NavShell from '@/components/NavShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WholesalePro — B2B Distribution Hub',
  description: 'Route-based wholesale distribution management for Pakistani retail supply chains.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ backgroundColor: '#f7f9fb', color: '#191c1e' }}>
        <CartProvider>
          <NavShell>{children}</NavShell>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Geist', sans-serif",
                fontSize: '14px',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#006c49', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
