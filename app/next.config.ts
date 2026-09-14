import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // This app lives inside the FirstBite monorepo alongside the Anchor
  // workspace (which has its own yarn.lock at the repo root) — pin the
  // Turbopack root to this directory so it doesn't get inferred from that
  // sibling lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
