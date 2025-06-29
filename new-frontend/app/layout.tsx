import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { Navigation } from '../components/Navigation';

export const metadata = {
  title: 'Painel do Cliente',
  description: 'Gerencie suas assinaturas e serviços',
};

export default function RootLayout(): void {
  return (
    <html lang='pt-BR'>
      <body className='bg-slate-50 text-slate-900 min-h-screen'>
        <Providers>
          <Navigation />
          <main className='container mx-auto px-4 py-8'>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
