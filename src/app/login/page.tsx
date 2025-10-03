'use client';

import React, { useState } from 'react';
import { Modal, Input as AntInput, Button as AntButton, App } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pendingAuthId, setPendingAuthId] = useState('');
  const [twoFACode, setTwoFACode] = useState('');

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });

  // Ensure light mode on mount
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({
        account: formData.usernameOrEmail,
        password: formData.password,
        remember_me: formData.rememberMe,
      });

      if (response.code !== 0) {
        message.error(response.message || 'Login failed');
        return;
      }

      if (response.data?.require_2fa) {
        setPendingAuthId(response.data.pending_auth_id || '');
        setShow2FAModal(true);
      } else if (response.data?.tokens) {
        authService.saveTokens(response.data.tokens);
        message.success('Login successful!');
        router.push('/chat');
      }
    } catch (error: any) {
      message.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async () => {
    if (twoFACode.length !== 6) {
      message.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verify2FA({
        pending_auth_id: pendingAuthId,
        code: twoFACode,
      });

      if (response.error) {
        message.error(response.error);
        return;
      }

      if (response.data?.tokens) {
        authService.saveTokens(response.data.tokens);
        message.success('Login successful!');
        setShow2FAModal(false);
        router.push('/chat');
      }
    } catch (error: any) {
      message.error(error.message || '2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light p-4 dark:bg-background-dark font-display">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md bg-primary-10 px-3 py-2 text-sm font-semibold text-primary dark:bg-primary-20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
              </svg>
              <span className="text-lg">ConnectHub</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-background-dark dark:text-background-light">
            Welcome back!
          </h1>
          <p className="text-sm text-background-dark-60 dark:text-background-light-60">
            Log in to your account.
          </p>
        </div>

        <div className="rounded-xl border border-background-dark-10 bg-card-light p-6 shadow-sm dark:border-background-light-10 dark:bg-card-dark sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username-email"
                className="mb-2 block text-sm font-medium text-background-dark dark:text-background-light"
              >
                Username or Email
              </label>
              <input
                id="username-email"
                type="text"
                value={formData.usernameOrEmail}
                onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                placeholder="Enter your username or email"
                className="w-full rounded-md border-background-dark-20 bg-background-light py-2 px-4 text-sm text-background-dark focus:border-primary focus:ring-primary dark:border-background-light-20 dark:bg-background-dark dark:text-background-light"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-background-dark dark:text-background-light"
                >
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full rounded-md border-background-dark-20 bg-background-light py-2 px-4 text-sm text-background-dark focus:border-primary focus:ring-primary dark:border-background-light-20 dark:bg-background-dark dark:text-background-light"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-background-dark-20 bg-background-light text-primary focus:ring-primary dark:border-background-light-20 dark:bg-background-dark dark:focus:ring-offset-background-dark"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-background-dark dark:text-background-light">
                Remember me for 90 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-background-dark"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-background-dark-60 dark:text-background-light-60">
              Don't have an account?{' '}
            </span>
            <Link href="/register" className="text-sm font-medium text-primary hover:underline">
              Register Account
            </Link>
          </div>
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-md text-background-dark-60 transition-colors hover:bg-background-dark-5 hover:text-background-dark dark:text-background-light-60 dark:hover:bg-background-light-5 dark:hover:text-background-light"
        >
          <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
        </button>
      </div>

      {/* 2FA Modal */}
      <Modal
        title="Two-Factor Authentication"
        open={show2FAModal}
        onCancel={() => setShow2FAModal(false)}
        footer={null}
        centered
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Enter 6-digit code</label>
            <AntInput
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>
          <AntButton
            type="primary"
            loading={loading}
            onClick={handle2FASubmit}
            className="w-full"
            size="large"
          >
            Verify
          </AntButton>
        </div>
      </Modal>
    </div>
  );
}
