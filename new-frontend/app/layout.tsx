import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'Novo Frontend',
  description: 'Frontend recriado com Next.js e Tailwind CSS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-black min-h-screen">
        <Providers>
          <main className="container mx-auto p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
