import { useEffect, useState } from "react";



export default function Bulletin(){
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect( () => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/msg");
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const text = await res.text();
                setMessage(text);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            }
        };

        fetchData();

    },[]);

    return(
        <div className="border border-red-500">
            <p>{error || message}</p>
            <img />
            <button></button>
        </div>
    );
}
