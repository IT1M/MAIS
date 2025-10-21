import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Saudi Mais Co.
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Medical Products Inventory Management
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Login functionality will be implemented in the next phase.
            </p>
            <p className="text-sm text-center text-muted-foreground">
              Please configure your database and create user accounts first.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
