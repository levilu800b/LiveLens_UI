// src/config/index.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  backendUrl: import.meta.env.VITE_BACKEND_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  nodeEnv: import.meta.env.VITE_NODE_ENV,
  maxFileSize: import.meta.env.VITE_MAX_FILE_SIZE,
  isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: import.meta.env.VITE_NODE_ENV === 'production',
};

// Validation
const requiredEnvVars = [
  'VITE_API_BASE_URL',
];

const missingEnvVars = requiredEnvVars.filter(
  envVar => !import.meta.env[envVar]
);

if (missingEnvVars.length > 0 && config.isProduction) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}