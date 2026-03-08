import { AttachmentType, Prisma } from "@/generated/prisma/client";
import requireAdmin from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type IncomingAttachment = {
  type: "image" | "file";
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
};

type CreateMessageBody = {
  text?: string;
  attachments?: IncomingAttachment[];
};

function parseAttachments(value: unknown): IncomingAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const parsed: IncomingAttachment[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Record<string, unknown>;
    const type = candidate.type;
    const fileName = candidate.fileName;
    const mimeType = candidate.mimeType;
    const size = candidate.size;
    const url = candidate.url;
    const thumbnailUrl = candidate.thumbnailUrl;

    if (type !== "image" && type !== "file") {
      continue;
    }

    if (
      typeof fileName !== "string" ||
      typeof mimeType !== "string" ||
      typeof size !== "number" ||
      Number.isNaN(size) ||
      typeof url !== "string"
    ) {
      continue;
    }

    parsed.push({
      type,
      fileName,
      mimeType,
      size,
      url,
      thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : null,
    });
  }

  return parsed;
}

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) {
    return authError;
  }

  const messages = await prisma.message.findMany({
    include: {
      attachments: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) {
    return authError;
  }

  let body: CreateMessageBody;
  try {
    body = (await req.json()) as CreateMessageBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const attachments = parseAttachments(body.attachments);

  if (!text && attachments.length === 0) {
    return NextResponse.json(
      { error: "Message must include text or attachments" },
      { status: 400 },
    );
  }

  const createAttachments: Prisma.AttachmentCreateWithoutMessageInput[] = attachments.map(
    (attachment) => ({
      type:
        attachment.type === "image"
          ? AttachmentType.image
          : AttachmentType.file,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url,
      thumbnailUrl: attachment.thumbnailUrl ?? null,
    }),
  );

  const message = await prisma.message.create({
    data: {
      text,
      attachments: {
        create: createAttachments,
      },
    },
    include: {
      attachments: true,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
