import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { UserRole } from '@/types';
import { AlertTriangle, FileText, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface RoleBasedContentProps {
  userRole: UserRole;
  locale: string;
  stats?: {
    recentReports?: number;
    pendingAudits?: number;
    systemAlerts?: number;
  };
}

export function RoleBasedContent({ userRole, locale, stats }: RoleBasedContentProps) {
  // DATA_ENTRY: Emphasize data entry actions
  if (userRole === 'DATA_ENTRY') {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center text-green-700 dark:text-green-400">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Keep up the great work! Your entries help maintain accurate inventory records.
          </p>
          <Link href={`/${locale}/data-entry`}>
            <Button variant="primary" className="w-full">
              Add New Entry
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // MANAGER: Show analytics summary and reports
  if (userRole === 'MANAGER') {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
            <FileText className="w-5 h-5 mr-2" />
            Management Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recent Reports</span>
              <span className="font-semibold">{stats?.recentReports || 0}</span>
            </div>
            <Link href={`/${locale}/analytics`}>
              <Button variant="outline" className="w-full">
                View Analytics Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // AUDITOR: Show audit events and system alerts
  if (userRole === 'AUDITOR') {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700 dark:text-red-400">
            <Shield className="w-5 h-5 mr-2" />
            Audit Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Reviews</span>
              <span className="font-semibold">{stats?.pendingAudits || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">System Alerts</span>
              <span className="font-semibold text-red-600">{stats?.systemAlerts || 0}</span>
            </div>
            <Link href={`/${locale}/audit`}>
              <Button variant="outline" className="w-full">
                View Audit Logs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ADMIN and SUPERVISOR: Show system overview
  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700 dark:text-purple-400">
          <AlertTriangle className="w-5 h-5 mr-2" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All systems operational. Monitor key metrics and manage team activities.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/${locale}/analytics`}>
              <Button variant="outline" size="sm" className="w-full">
                Analytics
              </Button>
            </Link>
            <Link href={`/${locale}/audit`}>
              <Button variant="outline" size="sm" className="w-full">
                Audit Logs
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
