import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import requireAdmin from "./lib/api-auth";

export function middleware(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/uploads/:path*", "/api/files/:path*"],
};
