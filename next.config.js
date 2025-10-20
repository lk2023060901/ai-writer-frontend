/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@heroui/react', 'react-icons']
  },
  modularizeImports: {
    '@heroui/react': {
      transform: '@heroui/{{member}}'
    }
  },

  // Transpile packages for compatibility
  transpilePackages: ['antd', '@ant-design/icons', 'rc-util', 'rc-pagination', 'rc-picker'],

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // API Proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },

  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

const isAnalyze = process.env.ANALYZE === 'true';
const withBundleAnalyzer = isAnalyze
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;
module.exports = withBundleAnalyzer(nextConfig);
