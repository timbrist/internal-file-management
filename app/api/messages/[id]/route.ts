import requireAdmin from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

type Params = {
  params: Promise<{ id: string }>;
};

function extractUploadTarget(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (url.startsWith("/uploads/")) {
    return url.replace(/^\/+/, "");
  }

  if (url.startsWith("/api/files/")) {
    return url.replace(/^\/+api\/files\//, "uploads/");
  }

  return null;
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) {
    return authError;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing message id" }, { status: 400 });
  }

  const existing = await prisma.message.findUnique({
    where: { id },
    include: { attachments: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  try {
    await prisma.message.delete({
      where: { id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    throw error;
  }

  const fileTargets = new Set<string>();
  for (const attachment of existing.attachments) {
    const fileTarget = extractUploadTarget(attachment.url);
    if (fileTarget) {
      fileTargets.add(fileTarget);
    }

    const thumbnailTarget = extractUploadTarget(attachment.thumbnailUrl);
    if (thumbnailTarget) {
      fileTargets.add(thumbnailTarget);
    }
  }

  await Promise.all(
    Array.from(fileTargets).map(async (target) => {
      const filePath = path.join(process.cwd(), "public", target);
      await unlink(filePath).catch(() => null);
    }),
  );

  return NextResponse.json({ id, deleted: true });
}
