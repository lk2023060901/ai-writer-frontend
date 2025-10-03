'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, App } from 'antd';
import { authService } from '@/services/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    authService.clearTokens();
    message.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background-light p-8 dark:bg-background-dark">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-background-dark dark:text-background-light">
            Dashboard
          </h1>
          <Button onClick={handleLogout} type="primary" danger>
            Logout
          </Button>
        </div>

        <div className="rounded-xl border border-background-dark/10 bg-card-light p-8 shadow-sm dark:border-background-light/10 dark:bg-card-dark">
          <p className="text-background-dark dark:text-background-light">
            Welcome to your dashboard! You are successfully logged in.
          </p>
        </div>
      </div>
    </div>
  );
}
