import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Check if Clerk is configured
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here' &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_your_key_here';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/pricing',
  '/privacy',
  '/terms',
  '/blog',
  '/api/webhooks(.*)',
  '/api/debug-db',
  '/api/oracle/chat'
])

// Only use Clerk middleware if keys are configured
const middleware = hasClerkKeys 
  ? clerkMiddleware(async (auth, request) => {
      const { userId } = await auth()
      
      // Redirect authenticated users from landing page to home
      if (userId && request.nextUrl.pathname === '/') {
        const homeUrl = new URL('/home', request.url)
        return NextResponse.redirect(homeUrl)
      }

      if (!isPublicRoute(request)) {
        await auth.protect()
      }
    })
  : // Fallback middleware when Clerk is not configured
    async (request: any) => {
      // Allow all routes when Clerk is not configured (development mode)
      return NextResponse.next()
    }

export default middleware

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
