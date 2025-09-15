/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 13+, no experimental flag needed
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  // 동적 라우트 문제 해결
  experimental: {
    missingSuspenseWithCSRBailout: false
  },
  // 라우팅 문제 해결을 위한 rewrite 규칙
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // 동적 라우트가 제대로 처리되도록 명시적 설정
        {
          source: '/services/:tab',
          destination: '/services/:tab'
        },
        {
          source: '/withdrawal/:tab',
          destination: '/withdrawal/:tab'
        },
        {
          source: '/groups/:tab',
          destination: '/groups/:tab'
        }
      ],
      fallback: []
    }
  }
}

module.exports = nextConfig