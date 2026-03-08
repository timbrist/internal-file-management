"use client";

import { Message, UploadedAttachmentPayload } from "@/lib/chat-types";
import { useCallback, useEffect, useState } from "react";
import Composer from "./Composer";
import LogoutBtn from "./LogoutBtn";
import MessageList from "./MessageList";

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", { cache: "no-store" });
      const payload = await parseJsonSafe<Message[] | { error?: string }>(response);

      if (!response.ok) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Failed to load messages",
        );
      }

      setMessages((payload as Message[]) ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleCreate = async ({
    text,
    attachments,
  }: {
    text: string;
    attachments: UploadedAttachmentPayload[];
  }) => {
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, attachments }),
      });

      const payload = await parseJsonSafe<Message | { error?: string }>(response);
      if (!response.ok) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Failed to create message",
        );
      }

      if (payload && !("error" in payload)) {
        setMessages((previous) => [payload as Message, ...previous]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this message?");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      });

      const payload = await parseJsonSafe<Message | { error?: string }>(response);
      if (!response.ok) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Failed to delete message",
        );
      }

      if (payload && !("error" in payload)) {
        setMessages((previous) =>
          previous.map((message) => (message.id === id ? (payload as Message) : message)),
        );
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete message",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-4 md:p-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Internal Message Board</h1>
          <p className="text-sm text-base-content/70">
            Text, pasted screenshots, uploads, and drag-and-drop attachments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            disabled={loading || refreshing}
            onClick={() => void handleRefresh()}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <LogoutBtn />
        </div>
      </header>

      {error && <p className="alert alert-error text-sm">{error}</p>}

      {loading ? (
        <section className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <span className="loading loading-dots loading-sm" />
          </div>
        </section>
      ) : (
        <MessageList messages={messages} deletingId={deletingId} onDelete={handleDelete} />
      )}

      <Composer sending={sending} onSend={handleCreate} />
    </main>
  );
}
