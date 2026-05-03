import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '../components/shared/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkShift — Internal Schedule Manager',
  description: 'Manage your team work schedules efficiently',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
