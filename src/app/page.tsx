import { redirect } from 'next/navigation';
import { auth } from '@/services/auth';

export default async function Home() {
  const session = await auth();
  
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
