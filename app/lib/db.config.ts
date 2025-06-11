/**
 * Database configuration
 * Provides database connection information for the application
 */

// Ensure environment variables are loaded
import 'dotenv/config';

// PostgreSQL connection parameters
export const DB_CONFIG = {
  // PostgreSQL connection string - Neon
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/crystalmatch",
  
  // Connection pool configuration
  CONNECTION_LIMIT: parseInt(process.env.PG_CONNECTION_LIMIT || "10"),
  IDLE_TIMEOUT: parseInt(process.env.PG_IDLE_TIMEOUT || "30000"),
  
  // JWT secret key
  JWT_SECRET: process.env.JWT_SECRET || "crystalmatch-secure-jwt-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // Application URL
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // OpenAI API key
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  
  // Log level
  LOG_LEVEL: process.env.LOG_LEVEL || "info"
};

/**
 * Get database connection URL
 * @returns Database connection URL
 */
export function getDatabaseUrl(): string {
  return DB_CONFIG.DATABASE_URL;
}

/**
 * Get database connection options
 * @returns Database connection options object
 */
export function getDbConnectionOptions() {
  return {
    connectionLimit: DB_CONFIG.CONNECTION_LIMIT,
    idleTimeout: DB_CONFIG.IDLE_TIMEOUT
  };
}

/**
 * Get JWT secret key
 * @returns JWT secret key
 */
export function getJwtSecret(): string {
  return DB_CONFIG.JWT_SECRET;
}

/**
 * Get JWT expiration time
 * @returns JWT expiration time
 */
export function getJwtExpiresIn(): string {
  return DB_CONFIG.JWT_EXPIRES_IN;
}

/**
 * Get application URL
 * @returns Application URL
 */
export function getAppUrl(): string {
  return DB_CONFIG.APP_URL;
}

/**
 * Get OpenAI API key
 * @returns OpenAI API key
 */
export function getOpenAiApiKey(): string {
  // Prioritize direct environment variable access to ensure latest value
  const directApiKey = process.env.OPENAI_API_KEY;
  if (directApiKey && directApiKey.trim() !== '') {
    console.log('Using OpenAI API key from environment variable');
    return directApiKey;
  }
  
  // If not set in environment variables, get from config
  if (DB_CONFIG.OPENAI_API_KEY && DB_CONFIG.OPENAI_API_KEY.trim() !== '') {
    console.log('Using OpenAI API key from DB_CONFIG');
    return DB_CONFIG.OPENAI_API_KEY;
  }
  
  console.warn('WARNING: No OpenAI API key found in environment variables');
  return ''; // Return empty string, which will cause OpenAI client initialization to fail
}

/**
 * Get log level
 * @returns Log level
 */
export function getLogLevel(): string {
  return DB_CONFIG.LOG_LEVEL;
} 