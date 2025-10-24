import { auth } from '@/services/auth';
import { redirect as nextIntlRedirect } from '@/i18n/routing';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Check for existing session
  const session = await auth();
  const { locale } = await params;

  // Redirect authenticated users to dashboard
  if (session) {
    nextIntlRedirect({ href: '/dashboard', locale });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Reset Your Password</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Enter your email address and we&apos;ll help you reset your password.
          </p>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
