/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lcnudonuslqefbxzghjt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
  },

  // Configurações Experimentais e Server Actions
  experimental: {
    optimizeCss: true,
    // CORREÇÃO CRÍTICA PARA UPLOADS:
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Removido cpus: 1 e workerThreads: false a menos que seu ambiente de build seja muito limitado
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Suas preferências de Build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        maxSize: 244000,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
