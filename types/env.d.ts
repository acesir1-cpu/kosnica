/**
 * Type definitions for environment variables
 * This ensures type safety when accessing process.env variables
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Application Environment
    readonly NEXT_PUBLIC_APP_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_APP_URL: string;

    // API Configuration
    readonly NEXT_PUBLIC_API_URL: string;

    // Site Configuration
    readonly NEXT_PUBLIC_SITE_NAME: string;
    readonly NEXT_PUBLIC_SITE_DESCRIPTION: string;

    // Contact Information
    readonly NEXT_PUBLIC_CONTACT_EMAIL: string;
    readonly NEXT_PUBLIC_CONTACT_PHONE?: string;

    // Social Media
    readonly NEXT_PUBLIC_FACEBOOK_URL?: string;
    readonly NEXT_PUBLIC_INSTAGRAM_URL?: string;
    readonly NEXT_PUBLIC_TWITTER_URL?: string;

    // Analytics
    readonly NEXT_PUBLIC_GA_ID?: string;

    // Feature Flags
    readonly NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
    readonly NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE?: string;
  }
}
