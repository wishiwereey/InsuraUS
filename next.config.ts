import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-lib and @google/genai run only on the server routes; keep them out of the client bundle.
  serverExternalPackages: ["@google/genai"],
  poweredByHeader: false,
};

export default nextConfig;
