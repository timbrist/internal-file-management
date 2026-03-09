"use client";
/* eslint-disable @next/next/no-img-element */

import { Message } from "@/lib/chat-types";
import { formatFileSize } from "./UploadHandler";

type MessageListProps = {
  messages: Message[];
  deletingId: string | null;
  onDelete: (id: string) => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function resolveFileUrl(url: string) {
  if (url.startsWith("/uploads/")) {
    return url.replace(/^\/+uploads\//, "/api/files/");
  }

  return url;
}

export default function MessageList({
  messages,
  deletingId,
  onDelete,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <section className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <p className="text-sm text-base-content/70">
            No messages yet. Send one from the composer below.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {messages.map((message) => {
        const isDeleted = Boolean(message.deletedAt);

        return (
          <article
            key={message.id}
            className="card bg-base-100 border border-base-300 shadow-sm"
          >
            <div className="card-body gap-3">
              <div className="flex items-center justify-between gap-3">
                <time
                  className="text-xs text-base-content/60"
                  dateTime={message.createdAt}
                >
                  {formatDate(message.createdAt)}
                </time>
                <button
                  type="button"
                  className="btn btn-xs btn-error btn-outline"
                  disabled={isDeleted || deletingId === message.id}
                  onClick={() => onDelete(message.id)}
                >
                  {deletingId === message.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {isDeleted ? (
                <p className="text-sm italic text-base-content/60">Deleted</p>
              ) : (
                <>
                  {message.text && (
                    <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                  )}

                  {message.attachments.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {message.attachments.map((attachment) => {
                        const mainUrl = resolveFileUrl(attachment.url);
                        const previewUrl = resolveFileUrl(
                          attachment.thumbnailUrl ?? attachment.url,
                        );

                        return attachment.type === "image" ? (
                          <a
                            key={attachment.id}
                            href={mainUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-box border border-base-300"
                          >
                            <img
                              src={previewUrl}
                              alt={attachment.fileName}
                              className="h-40 w-full object-cover"
                            />
                          </a>
                        ) : (
                          <a
                            key={attachment.id}
                            href={mainUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-box border border-base-300 p-3 hover:bg-base-200"
                          >
                            <p className="truncate text-sm font-medium">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-base-content/60">
                              {formatFileSize(attachment.size)}
                            </p>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
