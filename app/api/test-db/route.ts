import { NextResponse } from 'next/server';

/**
 * Mock API endpoint for testing database connection
 * Simplified implementation for build purposes
 */
export async function GET() {
  try {
    // Return mock database status
    const mockDbStatus = {
      isConnected: true,
      responseTime: 5,
      version: '15.3',
      mode: 'mock'
    };
    
    // Mock user data
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'John Doe',
        role: 'user',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'Jane Smith',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Return mock results
    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to database (mock)',
      database: mockDbStatus,
      data: {
        userCount: mockUsers.length,
        users: mockUsers
      }
    });
  } catch (error) {
    console.error('Failed to test database connection:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error occurred while testing database connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 