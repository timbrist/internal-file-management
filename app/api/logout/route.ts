import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("Logged out", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  });
}
