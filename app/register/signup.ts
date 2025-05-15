interface SignupData {
  email: string;
  password: string;
  name?: string;
}

interface SignupResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  message?: string;
  error?: string;
}

/**
 * Handles user signup and automatically includes referral code if present
 */
export async function signupUser(data: SignupData): Promise<SignupResponse> {
  try {
    // Get inviter code from localStorage if it exists
    const inviterCode = typeof window !== 'undefined' 
      ? localStorage.getItem('inviterCode') 
      : null;
    
    // Add inviter code to request if present
    const requestData = {
      ...data,
      ...(inviterCode ? { inviterCode } : {})
    };
    
    // Make API request
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Signup failed');
    }
    
    const result = await response.json();
    
    // Clear inviter code from localStorage after successful signup
    if (inviterCode && typeof window !== 'undefined') {
      localStorage.removeItem('inviterCode');
    }
    
    return result;
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
} 