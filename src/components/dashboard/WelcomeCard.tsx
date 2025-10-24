import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { UserRole } from '@/types';

interface WelcomeCardProps {
  userName: string;
  userRole: UserRole;
}

export function WelcomeCard({ userName, userRole }: WelcomeCardProps) {
  const t = useTranslations();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getRoleDisplay = (role: UserRole) => {
    const roleMap: Record<UserRole, string> = {
      ADMIN: 'Administrator',
      MANAGER: 'Manager',
      SUPERVISOR: 'Supervisor',
      DATA_ENTRY: 'Data Entry',
      AUDITOR: 'Auditor',
    };
    return roleMap[role];
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('auth.welcome')}, {userName}!
            </h1>
            <p className="text-blue-100 text-lg">{currentDate}</p>
            <p className="text-blue-100 text-sm mt-1">{getRoleDisplay(userRole)}</p>
          </div>
          <div className="hidden md:block">
            <svg
              className="w-24 h-24 opacity-20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
