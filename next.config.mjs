/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { 
            key: 'Permissions-Policy', 
            value: 'camera=self' 
          },
          { 
            key: 'Feature-Policy', 
            value: 'camera *' 
          },
        ],
      },
    ];
  },
  // Add CORS config
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Optimize for mobile
  poweredByHeader: false,
  compress: true,
  optimizeFonts: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;