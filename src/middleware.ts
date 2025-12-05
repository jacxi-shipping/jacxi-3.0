import { NextResponse } from 'next/server';

export function middleware() {
  // For now, we'll handle authentication in the components
  // This can be enhanced later with proper token validation
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
  ],
};
