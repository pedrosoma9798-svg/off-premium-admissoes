/** @type {import('next').NextConfig} */
const nextConfig = {
  // A fonte Geist vem do pacote npm "geist" e precisa ser transpilada.
  transpilePackages: ['geist'],
  poweredByHeader: false,
}

export default nextConfig
