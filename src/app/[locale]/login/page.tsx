import { auth } from '@/services/auth';
import { redirect as nextIntlRedirect } from '@/i18n/routing';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  // Check for existing session
  const session = await auth();
  const { locale } = await params;
  const { callbackUrl, error } = await searchParams;

  // Redirect authenticated users to dashboard
  if (session) {
    nextIntlRedirect({ href: '/dashboard', locale });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Saudi Mais Co.</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Medical Products Inventory Management
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}
