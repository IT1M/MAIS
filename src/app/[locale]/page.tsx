import { redirect } from '@/i18n/routing';

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to dashboard
  redirect({ href: '/dashboard', locale });
}
