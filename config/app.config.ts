/**
 * Application-wide configuration
 * Centralized configuration for the Košnica.ba application
 */

export const appConfig = {
  // Application Info
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Košnica.ba',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Med za one koji znaju razliku',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  env: process.env.NEXT_PUBLIC_APP_ENV || 'development',

  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Contact Information
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@kosnica.ba',
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  },

  // Social Media Links
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    maintenanceMode: process.env.NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE === 'true',
  },

  // Analytics
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  },

  // App Settings
  settings: {
    defaultLanguage: 'bs' as const,
    supportedLanguages: ['bs', 'en'] as const,
    currency: 'BAM' as const,
    dateFormat: 'DD.MM.YYYY' as const,
  },
} as const;

// Type export for app config
export type AppConfig = typeof appConfig;
