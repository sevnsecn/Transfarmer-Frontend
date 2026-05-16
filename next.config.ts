import type { NextConfig } from "next";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:5001";

const FARM_SERVICE_URL =
  process.env.FARM_SERVICE_URL || "http://localhost:5002";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:5003";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:5004";

const UPLOAD_SERVICE_URL =
  process.env.UPLOAD_SERVICE_URL || "http://localhost:5005";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
//the ..._SERVICE_URL are parameters used to set the URL of the backend services depending on how we run it (local or docker or even production)
  async rewrites() { 
    return [
      {
        source: "/api/auth/:path*",
        destination: `${AUTH_SERVICE_URL}/api/auth/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${AUTH_SERVICE_URL}/api/users/:path*`,
      },
      {
        source: "/api/farms/:path*",
        destination: `${FARM_SERVICE_URL}/api/farms/:path*`,
      },
      {
        source: "/api/products/:path*",
        destination: `${PRODUCT_SERVICE_URL}/api/products/:path*`,
      },
      {
        source: "/api/orders/:path*",
        destination: `${ORDER_SERVICE_URL}/api/orders/:path*`,
      },
      {
        source: "/api/orderItems/:path*",
        destination: `${ORDER_SERVICE_URL}/api/orderItems/:path*`,
      },
      {
        source: "/api/upload/:path*",
        destination: `${UPLOAD_SERVICE_URL}/api/upload/:path*`,
      },
    ];
  },
};

export default nextConfig;