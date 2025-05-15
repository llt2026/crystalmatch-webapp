import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Validate user token
async function validateUserToken(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
    );
    
    return payload.userId || payload.sub;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Mock user data for development/build
const getMockUser = (userId: string) => ({
  id: userId,
  email: 'user@example.com',
  name: 'Test User',
  location: {
    country: 'United States',
    timezone: 'America/New_York'
  },
  birthInfo: {
    date: '1990-01-01T00:00:00.000Z',
    time: '12:00:00'
  },
  preferences: {
    notifications: true,
    language: 'en',
    theme: 'dark'
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
});

/**
 * Get user profile - mock implementation for build
 * GET /api/user/profile
 */
export async function GET(request: NextRequest) {
  try {
    // Validate user identity
    const userId = await validateUserToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock user data
    const mockUser = getMockUser(userId.toString());
    const { id, ...userProfile } = mockUser;
    
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * Update user profile - mock implementation for build
 * PUT /api/user/profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Validate user identity
    const userId = await validateUserToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const updates = await request.json();
    
    // Filter allowed fields
    const allowedUpdates = ['name', 'location', 'birthInfo', 'preferences'];
    const filteredUpdates: Record<string, any> = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Get mock user and merge updates
    const mockUser = getMockUser(userId.toString());
    const updatedUser = {
      ...mockUser,
      ...filteredUpdates,
      updatedAt: new Date().toISOString()
    };

    // Return updated profile
    const { id, ...updatedProfile } = updatedUser;
    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 