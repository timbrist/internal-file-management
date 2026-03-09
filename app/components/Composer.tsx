"use client";
/* eslint-disable @next/next/no-img-element */

import {
  DraftAttachment,
  UploadedAttachmentPayload,
} from "@/lib/chat-types";
import { useEffect, useRef, useState } from "react";
import {
  formatFileSize,
  toDraftAttachment,
  uploadAttachment,
  validateAttachment,
} from "./UploadHandler";

type ComposerProps = {
  sending: boolean;
  onSend: (payload: {
    text: string;
    attachments: UploadedAttachmentPayload[];
  }) => Promise<void>;
};

function revokeDraftUrls(items: DraftAttachment[]) {
  items.forEach((item) => {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
}

export default function Composer({ sending, onSend }: ComposerProps) {
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<DraftAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draftsRef = useRef<DraftAttachment[]>([]);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    return () => {
      revokeDraftUrls(draftsRef.current);
    };
  }, []);

  const addFiles = (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const errors: string[] = [];
    const nextDrafts: DraftAttachment[] = [];

    files.forEach((file) => {
      const validationError = validateAttachment(file);
      if (validationError) {
        errors.push(validationError);
        return;
      }

      nextDrafts.push(toDraftAttachment(file));
    });

    if (errors.length > 0) {
      setError(errors.join(", "));
    } else {
      setError(null);
    }

    if (nextDrafts.length > 0) {
      setDrafts((previous) => [...previous, ...nextDrafts]);
    }
  };

  const removeDraft = (localId: string) => {
    setDrafts((previous) => {
      const target = previous.find((draft) => draft.localId === localId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return previous.filter((draft) => draft.localId !== localId);
    });
  };

  const clearComposer = () => {
    revokeDraftUrls(draftsRef.current);
    setText("");
    setDrafts([]);
    setError(null);
    draftsRef.current = [];

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (sending) {
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText && drafts.length === 0) {
      return;
    }

    setError(null);

    const uploadedAttachments: UploadedAttachmentPayload[] = [];

    try {
      for (const draft of drafts) {
        setDrafts((previous) =>
          previous.map((item) =>
            item.localId === draft.localId
              ? { ...item, status: "uploading" }
              : item,
          ),
        );

        const uploaded = await uploadAttachment(draft.file);
        uploadedAttachments.push(uploaded);

        setDrafts((previous) =>
          previous.map((item) =>
            item.localId === draft.localId
              ? { ...item, status: "uploaded", uploaded }
              : item,
          ),
        );
      }

      await onSend({
        text: trimmedText,
        attachments: uploadedAttachments,
      });

      clearComposer();
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "Failed to send message";
      setError(message);
      setDrafts((previous) =>
        previous.map((item) =>
          item.status === "uploading" ? { ...item, status: "error" } : item,
        ),
      );
    }
  };

  return (
    <section className="card bg-base-100 border border-base-300 shadow-sm">
      <div
        className={`card-body gap-3 transition ${
          dropActive ? "bg-base-200" : ""
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDropActive(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDropActive(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <textarea
          className="textarea textarea-bordered min-h-28 w-full"
          placeholder="Type a message, paste screenshots/files, or drag files here..."
          value={text}
          disabled={sending}
          onChange={(event) => setText(event.target.value)}
          onPaste={(event) => {
            const files = Array.from(event.clipboardData.items)
              .filter((item) => item.kind === "file")
              .map((item) => item.getAsFile())
              .filter((file): file is File => file !== null);

            addFiles(files);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void handleSend();
            }
          }}
        />

        {drafts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-base-content/70">Draft attachments</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {drafts.map((draft) => (
                <div
                  key={draft.localId}
                  className="rounded-box border border-base-300 bg-base-200 p-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{draft.file.name}</p>
                      <p className="text-xs text-base-content/60">
                        {formatFileSize(draft.file.size)}
                      </p>
                      <p className="text-xs text-base-content/60 capitalize">
                        {draft.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-xs"
                      disabled={sending}
                      onClick={() => removeDraft(draft.localId)}
                    >
                      Remove
                    </button>
                  </div>

                  {draft.previewUrl && (
                    <img
                      src={draft.previewUrl}
                      alt={draft.file.name}
                      className="mt-2 h-28 w-full rounded-box object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={(event) => {
              const selectedFiles = event.target.files
                ? Array.from(event.target.files)
                : [];
              addFiles(selectedFiles);
            }}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline"
            disabled={sending}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload files
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={sending || (!text.trim() && drafts.length === 0)}
            onClick={() => void handleSend()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </section>
  );
}
