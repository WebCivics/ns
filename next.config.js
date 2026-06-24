/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true, // Useful for static exports and backwards compatibility with existing links
};

export default nextConfig;
