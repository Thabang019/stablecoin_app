// Environment configuration with validation and fallbacks
interface AppConfig {
  apiBaseUrl: string;
  apiAuthToken: string;
  backendUrl: string;
  appName: string;
  appVersion: string;
  enablePWA: boolean;
  enableAnalytics: boolean;
  debugMode: boolean;
}

// Validate required environment variables
const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    throw new Error(`Configuration error: ${name} is required`);
  }
  return value;
};

// Get configuration with validation
export const getConfig = (): AppConfig => {
  try {
    return {
      apiBaseUrl: validateEnvVar('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
      apiAuthToken: validateEnvVar('VITE_API_AUTH_TOKEN', import.meta.env.VITE_API_AUTH_TOKEN),
      backendUrl: validateEnvVar('VITE_BACKEND_URL', import.meta.env.VITE_BACKEND_URL),
      appName: import.meta.env.VITE_APP_NAME || 'Stablecoin App',
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
      enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV,
    };
  } catch (error) {
    console.error('Configuration validation failed:', error);
    // Return safe defaults for development
    return {
      apiBaseUrl: 'http://localhost:3000/api/v1',
      apiAuthToken: 'dev-token',
      backendUrl: 'http://localhost:8080',
      appName: 'Stablecoin App',
      appVersion: '1.0.0',
      enablePWA: false,
      enableAnalytics: false,
      debugMode: true,
    };
  }
};

// Export singleton config
export const config = getConfig();

// Utility functions
export const isDevelopment = () => import.meta.env.DEV;
export const isProduction = () => import.meta.env.PROD;

// API endpoints builder
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = config.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

export const buildBackendUrl = (endpoint: string): string => {
  const baseUrl = config.backendUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
};