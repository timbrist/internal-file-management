import requireAdmin from "@/lib/api-auth";
import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

type Params = {
  params: Promise<{ segments: string[] }>;
};

const MIME_BY_EXT: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

function resolveUploadPath(segments: string[]) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const requestedPath = path.resolve(uploadDir, ...segments);
  const safePrefix = `${uploadDir}${path.sep}`;

  if (!requestedPath.startsWith(safePrefix)) {
    return null;
  }

  return requestedPath;
}

export async function GET(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) {
    return authError;
  }

  const { segments } = await params;
  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });
  }

  const filePath = resolveUploadPath(segments);
  if (!filePath) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    const content = await readFile(filePath);
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": getMimeType(filePath),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
