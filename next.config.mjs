/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
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
        }
      ],
    },
  ],
};

export default nextConfig;
