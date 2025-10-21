import { Metadata } from 'next';
import { redirect } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Dashboard | Saudi Mais Co.',
  description: 'Inventory management dashboard',
};

export default function DashboardPage() {
  // Redirect to data-entry as the main dashboard
  redirect('/data-entry');
}
