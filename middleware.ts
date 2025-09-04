import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // you can hard-protect pages under /admin and /client
  // let token = req.cookies.get("token")?.value;
  // if (req.nextUrl.pathname.startsWith("/admin") && !token) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*"]
};
