/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow all HTTPS domains - for development purposes
      {
        protocol: 'https',
        hostname: '**',
      },
      // Allow all HTTP domains - for development purposes
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Additional domains for older Next.js compatibility
    domains: [
      'img.clerk.com',
      'images.clerk.dev',
      'www.gravatar.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
  },
};

export default nextConfig;
