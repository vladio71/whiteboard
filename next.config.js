/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // basePath: '/src',
    images: {
        domains: ['r4.wallpaperflare.com', "ucarecdn.com"],
    },
    experimental: {
        // esmExternals: false,
        // windowHistorySupport: true,
        optimizePackageImports: ['react-icons'],
    },
    modularizeImports: {
        "react-icons/(\\w*)/?": {
            transform: `@react-icons/all-files/{{ matches.[1] }}/{{ member }}`,
            skipDefaultConversion: true,
        },
    }


}

module.exports = nextConfig
