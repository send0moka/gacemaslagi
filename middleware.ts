import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const publicRoutes = ["/", "/service", "/histories", "/resources", "/about"]
const SUPER_ADMIN_EMAIL = "jehian.zuhry@mhs.unsoed.ac.id"

export default clerkMiddleware((auth, request) => {
  console.log("Middleware Debug:", {
    session: auth,
    headers: request.headers.get("x-clerk-user-email")
  })

  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const userEmail = request.headers.get("x-clerk-user-email")
    if (!userEmail || userEmail !== SUPER_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
