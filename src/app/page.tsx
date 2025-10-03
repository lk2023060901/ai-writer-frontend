'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      // Redirect to chat if logged in
      router.push('/chat');
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-background-dark dark:text-background-light">Loading...</p>
      </div>
    </div>
  );
}
