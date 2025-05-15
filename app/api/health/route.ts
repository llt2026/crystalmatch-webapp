import { NextResponse } from 'next/server';

/**
 * Health check API endpoint
 * Simplified version that doesn't require database connection
 */
export async function GET() {
  try {
    // Return system status with mock database info
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connected: true,
        responseTime: 5,
        mode: 'mock'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    // Return error status
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 500 });
  }
} 