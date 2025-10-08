'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, App } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  verification_code?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [timer, setTimer] = useState(120);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword === '');
  }, [password, confirmPassword]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (verificationSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setVerificationSent(false);
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verificationSent, timer]);

  const handleSendVerification = () => {
    const email = form.getFieldValue('email');
    if (!email) {
      message.error('Please enter your email first');
      return;
    }
    setVerificationSent(true);
    message.success('Verification code sent to your email');
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    if (!passwordsMatch) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        name: values.username,
        email: values.email,
        password: values.password,
      });

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Registration failed');
        return;
      }

      message.success(response.data?.message || 'Registration successful! Please verify your email.');

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light p-4 dark:bg-background-dark">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Navbar />
          <h1 className="mt-4 text-2xl font-bold text-background-dark dark:text-background-light">
            Create your account
          </h1>
          <p className="text-sm text-background-dark/60 dark:text-background-light/60">
            Start your journey with us.
          </p>
        </div>

        <div className="rounded-xl border border-background-dark/10 bg-card-light p-6 shadow-sm dark:border-background-light/10 dark:bg-card-dark sm:p-8">
          <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-4">
            <Form.Item
              label={<span className="text-sm font-medium text-background-dark dark:text-background-light">Username</span>}
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input
                placeholder="Enter your username"
                className="rounded-md border-background-dark/20 bg-background-light py-2 px-4 text-sm text-background-dark dark:border-background-light/20 dark:bg-background-dark dark:text-background-light"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-medium text-background-dark dark:text-background-light">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <div className="relative">
                <Input
                  placeholder="Enter your email"
                  className="rounded-md border-background-dark/20 bg-background-light py-2 pl-4 pr-40 text-sm text-background-dark dark:border-background-light/20 dark:bg-background-dark dark:text-background-light"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={verificationSent}
                    className={`flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium ${
                      verificationSent
                        ? 'cursor-not-allowed text-background-dark/50 dark:text-background-light/50'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30'
                    }`}
                  >
                    {verificationSent ? `Resend in ${timer}s` : 'Email Verification'}
                  </button>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-medium text-background-dark dark:text-background-light">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border-background-dark/20 bg-background-light py-2 px-4 text-sm text-background-dark dark:border-background-light/20 dark:bg-background-dark dark:text-background-light"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-medium text-background-dark dark:text-background-light">Confirm Password</span>}
              name="confirmPassword"
              rules={[
                { required: true, message: 'Please confirm your password' },
                {
                  validator: (_, value) =>
                    value && value === password
                      ? Promise.resolve()
                      : Promise.reject(new Error('Passwords do not match')),
                },
              ]}
              validateStatus={!passwordsMatch && confirmPassword ? 'error' : ''}
              help={!passwordsMatch && confirmPassword ? 'Passwords do not match.' : ''}
            >
              <Input.Password
                placeholder="Confirm your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`rounded-md border-background-dark/20 bg-background-light py-2 px-4 text-sm text-background-dark dark:border-background-light/20 dark:bg-background-dark dark:text-background-light ${
                  !passwordsMatch && confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              size="large"
            >
              Register
            </Button>
          </Form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
