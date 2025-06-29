'use client';

import { PropsWithChildren } from 'react';
import { useAuth } from '../lib/auth';
import { ToastProvider } from '../components/ui/use-toast';
import { LoadingScreen } from '../components/ui/LoadingSpinner';

export function Providers(): void {
  const { isLoading } = useAuth();

  if (isLoading) { {
    return <LoadingScreen message='Inicializando aplicação...' />;
  }

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

export default Providers;
