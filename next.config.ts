/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar webpack para ignorar a pasta de contratos
  webpack: (config: any) => {
    // Ignorar arquivos de contratos
    config.module.rules.push({
      test: /contracts\/.*\.(ts|js|sol)$/,
      use: 'ignore-loader',
    })

    return config
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  experimental: {},

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '_next/image',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: `/a/${process.env.UPLOADTHING_APP_KEY}/**`,
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: `/f/**`,
      },
      {
        protocol: 'https',
        hostname: 'zx28uxibdv.ufs.sh',
        pathname: `/f/**`,
      },
    ],
  },
}

export default nextConfig
