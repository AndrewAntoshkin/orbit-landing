import type { NextConfig } from "next";

/** Project Pages: https://AndrewAntoshkin.github.io/orbit-landing/ */
const basePath = "/orbit-landing";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
