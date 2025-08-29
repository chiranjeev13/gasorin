import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ensure server components don't try to load wc libs
    serverComponentsExternalPackages: ["@walletconnect/web3wallet", "@walletconnect/core", "@walletconnect/utils"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
