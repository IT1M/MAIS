'use client';

import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '@/contexts/AppContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers component - Wraps the app with all necessary providers
 * Includes SessionProvider for authentication and AppProvider for global state
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </SessionProvider>
  );
}
