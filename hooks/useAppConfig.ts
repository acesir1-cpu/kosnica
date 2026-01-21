/**
 * React hook for accessing app configuration
 * Provides easy access to app config in React components
 */

import { appConfig } from '@/config/app.config';

/**
 * Hook to access application configuration
 * @returns App configuration object
 */
export function useAppConfig() {
  return appConfig;
}

/**
 * Hook to check if a feature is enabled
 * @param featureName - Name of the feature to check
 * @returns Boolean indicating if feature is enabled
 */
export function useFeatureFlag(featureName: keyof typeof appConfig.features) {
  return appConfig.features[featureName];
}
