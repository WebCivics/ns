import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  trailingSlash: true,

  async redirects() {
    return [
      {
        source: '/ontologies/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
  
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [{ type: 'query', key: 'format', value: 'ttl' }],
          destination: '/:path*.ttl',
        },
        {
          source: '/:path*',
          has: [{ type: 'query', key: 'format', value: 'jsonld' }],
          destination: '/:path*.jsonld',
        },
        {
          source: '/:path*',
          has: [{ type: 'query', key: 'format', value: 'n3' }],
          destination: '/:path*.n3',
        },
      ],
      fallback: [
        // HTML documentation lives under /ontologies internally; public links use
        // the shorter canonical namespace paths.
        {
          source: '/core/:path*',
          destination: '/ontologies/core/:path*',
        },
        {
          source: '/institutions/:path*',
          destination: '/ontologies/institutions/:path*',
        }
      ]
    };
  },

  async headers() {
    return [
      {
        source: '/core/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'Accept',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          }
        ],
      },
      {
        source: '/institutions/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'Accept',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          }
        ],
      },
    ];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}
