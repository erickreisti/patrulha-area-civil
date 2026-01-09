// next.config.js - Este arquivo deve estar na raiz do projeto
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
    qualities: [25, 50, 75, 85, 100],
    dangerouslyAllowSVG: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    disableStaticImages: false,

    unoptimized: false,
  },

  // Configuração experimental para melhorar performance
  experimental: {
    optimizeCss: true,
    workerThreads: false,
    cpus: 1,

    disableOptimizedLoading: false,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  poweredByHeader: false,

  // Adicionar headers de segurança e cache
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/logos/logo.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // Otimização de bundles
  webpack: (config, { dev, isServer }) => {
    // Otimizar imagens
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          images: {
            test: /[\\/]node_modules[\\/](next[\\/]image|.*\\.(png|jpg|jpeg|webp|svg)$)/,
            name: "images",
            chunks: "all",
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
