import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

/**
 * PageLoader component for full-page loading states
 * Displays a centered spinner with optional message
 */
export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
  return (
    <div className={cn('flex h-screen items-center justify-center', className)}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
