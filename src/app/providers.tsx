'use client';

import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { AntdProvider } from '@/shared/providers/AntdProvider';
import { AuthProvider } from '@/shared/context/AuthContext';
import { TabsProvider } from '@/shared/context/TabsContext';
import i18n from '@/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <HeroUIProvider>
            <AntdProvider>
              <AuthProvider>
                <TabsProvider>
                  {children}
                </TabsProvider>
              </AuthProvider>
            </AntdProvider>
          </HeroUIProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
