/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * API Proxy — rewrites frontend /api/* calls to the FastAPI backend.
   * This avoids CORS issues and keeps API URLs clean in the frontend code.
   *
   * In development : FastAPI runs at http://127.0.0.1:8000
   * In production  : set NEXT_PUBLIC_API_URL in your deployment environment
   */
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
