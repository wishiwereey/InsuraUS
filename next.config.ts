import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-lib and @google/genai run only on the server routes; keep them out of the client bundle.
  serverExternalPackages: ["@google/genai"],
  poweredByHeader: false,
  // Hide the Next.js dev-tools bubble (the "N" button) during `npm run dev`; it never ships to production anyway.
  devIndicators: false,
};

export default nextConfig;
