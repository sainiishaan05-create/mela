import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  async redirects() {
    return [
      {
        // Human-friendly /toronto/photographers → canonical /category/photographers/toronto
        // Constrained to known GTA city slugs to avoid catching other two-segment routes
        source: '/:city(toronto|brampton|mississauga|markham|vaughan|scarborough|richmond-hill|oakville|etobicoke|north-york|ajax|pickering|oshawa|whitby|burlington|milton|hamilton|kitchener-waterloo|guelph|newmarket|aurora|barrie|cambridge|brantford|windsor|london|st-catharines|niagara-falls)/:category',
        destination: '/category/:category/:city',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
