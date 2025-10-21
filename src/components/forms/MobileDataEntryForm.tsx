'use client';

import { useState, useEffect } from 'react';
import { DataEntryForm } from './DataEntryForm';

export function MobileDataEntryForm() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Prevent zoom on input focus for mobile
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }

      return () => {
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0'
          );
        }
      };
    }
  }, [isMobile]);

  return <DataEntryForm />;
}
