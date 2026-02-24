
import { useEffect, useRef, useState } from 'react'
import './App.css'
import Bulletin from './components/Bulletin'
import Clipboard from './components/Clipboard'

export type ChatMsg = {
  ok: boolean;
  messageId: number;
  updatedAt: string | null;
  text: string;
  image?: {
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null;
}

function App() {
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [message, setMessage] = useState<ChatMsg | null>(null);
  const [error, setError] = useState("");
  const latestMessageIdRef = useRef(0);

  const applyServerMessage = (nextMessage: ChatMsg, incrementTick = true) => {
    if (nextMessage.messageId < latestMessageIdRef.current) return;
    latestMessageIdRef.current = nextMessage.messageId;
    setMessage(nextMessage);
    if (incrementTick) {
      setRefreshTick((tick) => tick + 1);
    }
  };

  const fetchLatestMessage = async () => {
    try {
      const res = await fetch("/api/msg");
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: ChatMsg = await res.json();
      applyServerMessage(data, false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    fetchLatestMessage();
  }, []);

  const handleOnSent = (savedMessage: ChatMsg) => {
    applyServerMessage(savedMessage);
    setError("");
  };

  const handleDelete = async () => {
    try {
      const fd = new FormData();
      fd.append("text", "");
      const req = await fetch("/api/message", {
        method: "POST",
        body: fd,
      });
      if (!req.ok) {
        const errorText = await req.text();
        throw new Error(errorText || "Delete failed");
      }
      const data: ChatMsg = await req.json();
      applyServerMessage(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <>
      <div className='
      min-h-screen
      flex flex-col gap-5
      border border-gray-500 
      items-center justify-center
      '
      >
        <Bulletin
          message={message}
          refreshTick={refreshTick}
          error={error}
          onDelete={handleDelete}
        />
        <Clipboard onSent={handleOnSent}/>
      </div>

    </>
  )
}

export default App
