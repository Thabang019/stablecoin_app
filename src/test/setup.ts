import '@testing-library/jest-dom'

// Mock environment variables for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
    VITE_API_AUTH_TOKEN: 'test-token',
    VITE_BACKEND_URL: 'http://localhost:8080',
    VITE_APP_NAME: 'Stablecoin App',
    VITE_APP_VERSION: '1.0.0',
    VITE_ENABLE_PWA: 'false',
    VITE_ENABLE_ANALYTICS: 'false',
    VITE_DEBUG_MODE: 'true',
    DEV: true,
    PROD: false,
    MODE: 'test',
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}