import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mediverse — Health. Connected. Everywhere.',
  description: 'World-class digital healthcare platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
