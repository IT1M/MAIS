import { Skeleton } from './Skeleton';
import { cn } from '@/utils/cn';

interface ChartSkeletonProps {
  height?: number | string;
  showLegend?: boolean;
  showTitle?: boolean;
  className?: string;
}

/**
 * ChartSkeleton component for chart loading states
 * Displays skeleton placeholder matching chart structure
 */
export function ChartSkeleton({
  height = 300,
  showLegend = true,
  showTitle = true,
  className,
}: ChartSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={cn('w-full rounded-lg border border-border bg-card p-6', className)}>
      {/* Chart Title */}
      {showTitle && (
        <div className="mb-4">
          <Skeleton className="h-6 w-48" />
        </div>
      )}

      {/* Chart Area */}
      <div className="relative" style={{ height: heightStyle }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>

        {/* Chart bars/lines placeholder */}
        <div className="ml-12 mr-4 h-full flex items-end justify-around gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="ml-12 mr-4 mt-2 flex justify-around">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-12" />
          ))}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex items-center justify-center gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
