import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function checkBasicAuth(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const [type, credentials] = header.split(" ");

  if (type !== "Basic" || !credentials || !ADMIN_USER || !ADMIN_PASS) {
    return false;
  }

  const decoded = Buffer.from(credentials, "base64").toString("utf8");
  const idx = decoded.indexOf(":");

  if (idx < 0) {
    return false;
  }

  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  return user === ADMIN_USER && pass === ADMIN_PASS;
}


function unauthorized(message = "Auth required") {
  return new NextResponse(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  });
}

export default function requireAdmin(req: NextRequest) {
  if (!checkBasicAuth(req)) {
    return unauthorized();
  }

  return null;
}