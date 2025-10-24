import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { Package, User, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  itemName: string;
  batch: string;
  quantity: number;
  userName: string;
  createdAt: Date;
  destination: string;
}

interface RecentActivityTimelineProps {
  items: ActivityItem[];
}

export function RecentActivityTimeline({ items }: RecentActivityTimelineProps) {
  const t = useTranslations();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dataLog.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('dataLog.noEntries')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start space-x-4 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm truncate">{item.itemName}</p>
                  <Badge variant="default" className="ml-2 flex-shrink-0">
                    {item.destination}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <span className="flex items-center">
                    <Package className="w-3 h-3 mr-1" />
                    Batch: {item.batch}
                  </span>
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {item.userName}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
