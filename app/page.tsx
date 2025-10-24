import { redirect } from 'next/navigation';
import { auth } from '@/services/auth';
import { HomeLoginForm } from '@/components/auth/HomeLoginForm';

export default async function Home() {
  // Check for existing session
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/en/dashboard');
  }
  
  // Render login form for unauthenticated users
  return <HomeLoginForm />;
}
