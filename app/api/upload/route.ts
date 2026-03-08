import requireAdmin from "@/lib/api-auth";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) {
    return authError;
  }

  const formData = await req.formData();
  const maybeFile = formData.get("file");

  if (!(maybeFile instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const file = maybeFile;

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 10MB limit" },
      { status: 400 },
    );
  }

  const originalName = file.name || "attachment";
  const safeName = sanitizeFileName(originalName);
  const uniqueName = `${Date.now()}-${randomUUID()}-${safeName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const outputPath = path.join(uploadDir, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(outputPath, buffer);

  const mimeType = file.type || "application/octet-stream";
  const isImage = mimeType.startsWith("image/");
  const url = `/uploads/${uniqueName}`;

  return NextResponse.json({
    type: isImage ? "image" : "file",
    fileName: originalName,
    mimeType,
    size: file.size,
    url,
    thumbnailUrl: isImage ? url : null,
  });
}
