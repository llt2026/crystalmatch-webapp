import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/app/middleware/adminAuth';

export async function GET(request: NextRequest) {
  // Verify admin token
  const authError = await verifyAdminToken(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const pageSize = 10;

    // In a real application, this data would be fetched from a database
    // Using mock data for development purposes
    const mockUsers = Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      subscription: {
        status: Math.random() > 0.7 ? 'premium' : 'free',
        expiresAt: Math.random() > 0.7 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
      },
      reportsCount: Math.floor(Math.random() * 20)
    }));

    // Simulate search functionality
    let filteredUsers = mockUsers;
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      users: paginatedUsers,
      totalPages
    });
  } catch (error) {
    console.error('Failed to retrieve user list:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user list' },
      { status: 500 }
    );
  }
} 