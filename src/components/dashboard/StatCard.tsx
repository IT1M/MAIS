import { Card, CardContent } from '@/components/ui/Card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-gray-500';
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return Minus;
    return trend === 'up' ? ArrowUp : ArrowDown;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${getTrendColor()}`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
