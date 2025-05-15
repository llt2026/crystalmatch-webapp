import { NextRequest, NextResponse } from 'next/server';

interface SignupRequestBody {
  email: string;
  password: string;
  name?: string;
  inviterCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequestBody = await request.json();
    
    // Extract the inviter code if present
    const { email, password, name, inviterCode } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    console.log('Signup request received:', { email, name, inviterCode });
    
    // Here you would typically:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Store user in database
    // 4. If inviterCode exists, process referral reward
    // 5. Create session/token
    
    // For this example, we'll just return success with mock data
    return NextResponse.json({
      success: true,
      user: {
        id: 'user_' + Math.random().toString(36).substring(2, 15),
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
      },
      message: inviterCode 
        ? `Account created successfully with referral code: ${inviterCode}` 
        : 'Account created successfully'
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 