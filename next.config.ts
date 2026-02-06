import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Otimização de Imagens
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
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 2. Configurações Experimentais e Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Aumentado para suportar vídeos
    },
    optimizeCss: true,
  },

  // 3. Configurações de Compilação
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // 4. Preferências de Build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 5. Otimização
  poweredByHeader: false,

  // 6. Headers de Segurança
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

  // 7. Webpack
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        maxSize: 244000,
        minSize: 20000,
      };
    }
    return config;
  },
};

export default nextConfig;
