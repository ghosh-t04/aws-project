/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed deprecated experimental.appDir option (app dir is stable in modern Next)
  images: {
    domains: ['localhost'],
  },
  env: {
    AWS_REGION: process.env.AWS_REGION,
    AWS_USER_POOL_ID: process.env.AWS_USER_POOL_ID,
    AWS_USER_POOL_CLIENT_ID: process.env.AWS_USER_POOL_CLIENT_ID,
    AWS_IDENTITY_POOL_ID: process.env.AWS_IDENTITY_POOL_ID,
    API_GATEWAY_URL: process.env.API_GATEWAY_URL,
    OLLAMA_API_URL: process.env.OLLAMA_API_URL,
  },
};

module.exports = nextConfig;
