'use client';

import { useState } from 'react';
import { Header } from './Header';

interface TestLayoutProps {
  children: React.ReactNode;
}

export function TestLayout({ children }: TestLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
