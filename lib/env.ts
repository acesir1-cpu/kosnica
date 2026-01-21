/**
 * Environment variables utility
 * Provides type-safe access to environment variables with validation
 */

/**
 * Get an environment variable with optional default value
 */
export function getEnv(key: keyof NodeJS.ProcessEnv, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
}

/**
 * Get a boolean environment variable
 */
export function getEnvBoolean(key: keyof NodeJS.ProcessEnv, defaultValue = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get a number environment variable
 */
export function getEnvNumber(key: keyof NodeJS.ProcessEnv, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is not set`);
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return num;
}

/**
 * Validate required environment variables
 */
export function validateEnv(requiredVars: (keyof NodeJS.ProcessEnv)[]): void {
  const missing: string[] = [];
  
  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key as string);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
