"use client";

import {
  DraftAttachment,
  UploadedAttachmentPayload,
} from "@/lib/chat-types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function buildLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function validateAttachment(file: File): string | null {
  if (file.size <= 0) {
    return `${file.name}: empty file`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `${file.name}: exceeds 10MB`;
  }

  return null;
}

export function toDraftAttachment(file: File): DraftAttachment {
  const isImage = file.type.startsWith("image/");

  return {
    localId: buildLocalId(),
    file,
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
    type: isImage ? "image" : "file",
    status: "idle",
  };
}

export async function uploadAttachment(
  file: File,
): Promise<UploadedAttachmentPayload> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const errorMessage =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Upload failed";

    throw new Error(errorMessage);
  }

  return payload as UploadedAttachmentPayload;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
