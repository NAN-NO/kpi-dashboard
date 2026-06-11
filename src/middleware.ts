import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin only routes
    if (path.startsWith("/settings") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Editor or Admin routes
    if (path.startsWith("/entry") && token?.role === "viewer") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/settings/:path*", "/entry/:path*"]
}
