import { useEffect, useState } from "react";

type ChatMsg ={
    ok:boolean;
    text:string;
    image?:{
        name:string;
        type:string;
        size:number;
        dataUrl:string;
    }|null;
}

export default function Bulletin(){
    const [message, setMessage] = useState<ChatMsg|null>(null);
    const [error, setError] = useState("");

    useEffect( () => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/msg");
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const data = await res.json();
                setMessage(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            }
        };

        fetchData();

    },[]);

    return(
        <div className="border border-red-500">
            {error && <p>{error}</p>}
            {message &&
                <div>
                    {message.image && <img src={message.image.dataUrl} alt={message.image.name} />}
                    <p>{message.text}</p>
                </div>
            }
            <button></button>
        </div>
    );
}
