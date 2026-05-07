/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      // Já vamos deixar preparado para o Supabase
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  experimental: {
    cpus: 1,
    workerThreads: false,
  },

  typescript: {
    ignoreBuildErrors: true, // Pula a checagem pesada de tipos no build
  },

  eslint: {
    ignoreDuringBuilds: true, // Pula o lint no build
  },
};

export default nextConfig;
