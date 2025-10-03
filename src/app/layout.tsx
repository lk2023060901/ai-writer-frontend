import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider, theme, App } from 'antd';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConnectHub - Register',
  description: 'Create your ConnectHub account',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove dark class immediately to prevent flash
              document.documentElement.classList.remove('dark');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#1173d4',
              borderRadius: 8,
            },
          }}
        >
          <App>
            {children}
          </App>
        </ConfigProvider>
      </body>
    </html>
  );
}
