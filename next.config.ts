import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  transpilePackages: [
    '@ant-design/v5-patch-for-react-19',
  ],
};

export default nextConfig;
