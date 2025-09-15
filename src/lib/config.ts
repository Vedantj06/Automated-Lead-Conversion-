// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    endpoints: {
      auth: import.meta.env.VITE_AUTH_ENDPOINT || '/auth',
      leads: import.meta.env.VITE_LEADS_ENDPOINT || '/leads',
      campaigns: import.meta.env.VITE_CAMPAIGNS_ENDPOINT || '/campaigns',
      email: import.meta.env.VITE_EMAIL_ENDPOINT || '/email',
      search: import.meta.env.VITE_SEARCH_ENDPOINT || '/search',
      webReader: import.meta.env.VITE_WEB_READER_ENDPOINT || '/web-reader',
    },
    timeout: 10000,
  },

  // External Service API Keys
  services: {
    resend: {
      apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
    },
    openRouter: {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
    },
    replicate: {
      apiKey: import.meta.env.VITE_REPLICATE_API_KEY || '',
    },
    elevenLabs: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
    },
  },

  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Marketing Automation Platform',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },

  // Feature Flags (can be controlled via environment variables)
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    enableExternalServices: import.meta.env.VITE_ENABLE_EXTERNAL_SERVICES !== 'false',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },

  // Regional Settings
  regions: {
    supported: ['UAE', 'India', 'Australia', 'US'] as const,
    default: 'UAE' as const,
    timezones: {
      UAE: 'Asia/Dubai',
      India: 'Asia/Kolkata',
      Australia: 'Australia/Sydney',
      US: 'America/New_York',
    } as const,
  },

  // Business Services
  services_offered: [
    'Website Development',
    'Social Media Management',
    'Performance Marketing',
  ] as const,

  // Lead Scoring Configuration
  scoring: {
    weights: {
      contactInfo: 30, // Email, phone completeness
      companyInfo: 25, // Company, industry, title
      regional: 20,    // Target region match
      engagement: 25,  // Email opens, clicks, visits
    },
    thresholds: {
      high: 80,
      medium: 60,
      low: 40,
    },
  },

  // Email Campaign Configuration
  email: {
    defaultFrom: {
      email: 'noreply@youragency.com',
      name: 'Your Agency',
    },
    batchSize: 50,
    delayBetweenBatches: 1000, // milliseconds
    maxRetries: 3,
  },

  // Pagination Defaults
  pagination: {
    defaultLimit: 50,
    maxLimit: 200,
  },
} as const;

// Type definitions for configuration
export type Config = typeof config;
export type SupportedRegion = typeof config.regions.supported[number];
export type ServiceOffered = typeof config.services_offered[number];

// Helper functions
export const isProduction = () => config.app.environment === 'production';
export const isDevelopment = () => config.app.environment === 'development';
export const isExternalServiceEnabled = (service: keyof typeof config.services) => {
  return config.features.enableExternalServices && !!config.services[service].apiKey;
};

// Validation helpers
export const validateConfig = () => {
  const errors: string[] = [];

  // Check required environment variables in production
  if (isProduction()) {
    if (!config.api.baseUrl || config.api.baseUrl.includes('localhost')) {
      errors.push('VITE_API_URL must be set to a production URL');
    }
  }

  // Validate API URLs
  try {
    new URL(config.api.baseUrl);
  } catch {
    errors.push('VITE_API_URL must be a valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default config;