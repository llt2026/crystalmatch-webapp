import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { validateAdminToken } from './middleware/adminAuth';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/api/auth/send-code',
  '/api/auth/verify-code',
  '/api/auth/register',
  '/admin/login',
  '/api/admin/auth/login',
  '/subscription',
  '/subscription/test',
  '/subscription/success',
  '/subscription/cancel',
  '/api/subscription/webhook',
  '/api/subscription/create',
  '/test',
  '/_next',
  '/favicon.ico',
  '/register',
  '/api/webhook',
  '/birth-info',
  '/energy-reading',
  '/api/energy-reading',
  '/api/energy-results',
  '/energy-results',
  '/terms',
  '/privacy',
  '/api/health',
  '/api/auth/check',
  '/crystal-types',
  '/about',
  '/how-it-works',
  '/support',
  '/faq',
  '/contact',
  '/crystals',
  '/api/crystals',
  '/404',
  '/500',
  '/maintenance',
  '/api/public',
  '/api/crystals',
  '/public',
  '/assets',
  '/images',
  '/static',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if the path is for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const isAdmin = await validateAdminToken(request);
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    return NextResponse.next();
  }

  // Special handling for report pages to allow public annual-basic slugs
  if (pathname.startsWith('/report')) {
    const slug = pathname.split('/').pop() || '';
    const isFreeSlug = slug.startsWith('annual-basic-');
    if (isFreeSlug) {
      return NextResponse.next();
    }
    // For premium/monthly slug, require token later; fall through
  }

  // Regular user authentication (for non-public & non-free report)
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
    );
    
    // After verifying token exists, additional subscription check for paid reports
    if (pathname.startsWith('/report')) {
      const slug = pathname.split('/').pop() || '';
      // free slug already returned earlier
      if (!token) {
        return NextResponse.redirect(new URL('/subscription', request.url));
      }
      if (!token.includes('premium') && !token.includes('monthly') && !token.includes('yearly')) {
        return NextResponse.redirect(new URL('/subscription', request.url));
      }
      return NextResponse.next();
    }
    
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login page
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

// Configure middleware matching paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|_next/scripts|favicon.ico).*)',
    '/api/:path*',
  ],
}; 