import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Novo Frontend',
  description: 'Frontend recriado com Next.js e Tailwind CSS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-black min-h-screen">
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
