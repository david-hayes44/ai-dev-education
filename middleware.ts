import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Default Next.js middleware to allow all requests
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Redirect servers root to MCP page
  if (pathname === '/servers') {
    url.pathname = '/mcp'
    return NextResponse.redirect(url)
  }
  
  // Redirect building-servers to MCP page
  if (pathname === '/building-servers') {
    url.pathname = '/mcp'
    return NextResponse.redirect(url)
  }

  // Keep subpaths under /servers working to avoid breaking existing links
  // The UI navigation will now point to these pages through the MCP dropdown

  return NextResponse.next()
}

/**
 * Uncomment the following code to enable authentication with Clerk
 */

// const isProtectedRoute = createRouteMatcher(['/protected'])

// export default clerkMiddleware(async (auth, req) => {
//     if (isProtectedRoute(req)) {
//       // Handle protected routes check here
//       return NextResponse.redirect(req.nextUrl.origin)
//     }

//     return NextResponse.next()
// })  

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api/webhooks).*)",
  ],
}
