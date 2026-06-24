/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true, // Useful for backwards compatibility with existing links
  
  async rewrites() {
    return [
      // Explicit File Extension Serialization Rewrites
      {
        source: '/:path(.+\\.n3)',
        destination: '/raw/ontologies/:path',
      },
      {
        source: '/:path(.+\\.ttl)',
        destination: '/raw/ontologies/:path',
      },
      {
        source: '/:path(.+\\.jsonld)',
        destination: '/raw/ontologies/:path',
      },
      // UI / HTML Fallback Rewrites
      {
        source: '/core/:path*',
        destination: '/ontologies/core/:path*',
      },
      {
        source: '/institutions/:path*',
        destination: '/ontologies/institutions/:path*',
      },
      // 1. N3 Serialization
      {
        source: '/ontologies/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?=.*text/n3).*',
          },
        ],
        destination: '/raw/ontologies/:path*.n3',
      },
      // 2. Turtle Serialization
      {
        source: '/ontologies/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?=.*text/turtle).*',
          },
        ],
        destination: '/raw/ontologies/:path*.ttl',
      },
      // 3. JSON-LD Serialization
      {
        source: '/ontologies/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?=.*application/ld\\+json).*',
          },
        ],
        destination: '/raw/ontologies/:path*.jsonld',
      }
    ];
  },

  async headers() {
    return [
      {
        source: '/ontologies/:path*',
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
