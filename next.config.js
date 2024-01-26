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
}

module.exports = nextConfig
