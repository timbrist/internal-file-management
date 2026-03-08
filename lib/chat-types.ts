export type AttachmentType = "image" | "file";

export type Attachment = {
  id: string;
  type: AttachmentType;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
};

export type Message = {
  id: string;
  text: string;
  createdAt: string;
  deletedAt?: string | null;
  attachments: Attachment[];
};

export type UploadedAttachmentPayload = {
  type: AttachmentType;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
};

export type DraftAttachment = {
  localId: string;
  file: File;
  previewUrl?: string;
  type: AttachmentType;
  status: "idle" | "uploading" | "uploaded" | "error";
  uploaded?: UploadedAttachmentPayload;
};
