import { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataEntryPage } from '@/components/pages/DataEntryPage';

export const metadata: Metadata = {
  title: 'Data Entry | Saudi Mais Co.',
  description: 'Enter new inventory items',
};

export default function Page() {
  return (
    <MainLayout>
      <DataEntryPage />
    </MainLayout>
  );
}
