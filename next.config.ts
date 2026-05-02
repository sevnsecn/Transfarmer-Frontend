import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"; //forwards all /api/* calls to the backend

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com", // Catch all Cloudinary subdomains
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: "http://localhost:5001/api/auth/:path*" },
      { source: "/api/users/:path*", destination: "http://localhost:5001/api/users/:path*" },
      { source: "/api/farms/:path*", destination: "http://localhost:5002/api/farms/:path*" },
      { source: "/api/products/:path*", destination: "http://localhost:5003/api/products/:path*" },
      { source: "/api/orders/:path*", destination: "http://localhost:5004/api/orders/:path*" },
      { source: "/api/orderItems/:path*", destination: "http://localhost:5004/api/orderItems/:path*" },
      { source: "/api/upload/:path*", destination: "http://localhost:5005/api/upload/:path*" },
    ]
  }
};

export default nextConfig;