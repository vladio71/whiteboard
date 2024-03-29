/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: ['r4.wallpaperflare.com', "ucarecdn.com"],
    },
    experimental: {
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
