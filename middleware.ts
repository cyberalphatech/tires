import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// const protectedRoutes = ["/dashboard", "/clients", "/winter", "/summer", "/inventory", "/plate-reader", "/change"]

export function middleware(request: NextRequest) {
  return NextResponse.next()

  /* 
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || "tires-pro-secret-key-2024"

      jwt.verify(token, jwtSecret)
      return NextResponse.next()
    } catch (error) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
