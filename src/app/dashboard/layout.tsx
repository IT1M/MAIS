import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-primary">Saudi Mais Co.</h2>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
