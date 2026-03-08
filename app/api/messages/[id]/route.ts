import requireAdmin from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) {
    return authError;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing message id" }, { status: 400 });
  }

  try {
    const updated = await prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { attachments: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    throw error;
  }
}
