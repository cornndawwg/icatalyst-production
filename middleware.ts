import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only handle /api/* routes (excluding Next.js internal _next routes)
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/_next')) {
    // Get the backend URL from environment or use the Railway backend URL
    const API_URL = process.env.NODE_ENV === 'production' 
      ? 'https://icatalyst-production-production.up.railway.app'
      : 'http://localhost:3001';
    
    // Create new URL with backend host
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, API_URL);
    
    // Clone the request headers
    const headers = new Headers(request.headers);
    
    // Forward the request to backend
    return NextResponse.rewrite(url, {
      headers: headers,
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};