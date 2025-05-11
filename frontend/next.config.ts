import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options here */

  /**
   * !! WARN !!
   * Dangerously allow production builds to successfully complete even if
   * your project has ESLint errors.
   * It is recommended to lint separately as part of your build process.
   * !! WARN !!
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * !! WARN !!
   * Dangerously allow production builds to successfully complete even if
   * your project has TypeScript errors.
   * It is recommended to type-check separately as part of your build process.
   * !! WARN !!
   */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;