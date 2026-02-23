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

export default function Bulletin(
    {refreshKey, onRefreshChange}:{refreshKey:boolean; onRefreshChange:(re:boolean)=>void}
){
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
        console.log("Finished Fetch refreshKey:",refreshKey)
    },[refreshKey]);

    const handleOnclick = async () =>{
        try {
            const fd = new FormData();
            fd.append("text", "");

            const req = await fetch("/api/message",{
                method:"POST",
                body:fd,
            });

            if(!req.ok){ 
                const errorText = await req.text();
                throw new Error(errorText || "delete failed");
            }

            setMessage(null);
            setError("");
            onRefreshChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
        }
    };

    return(
        <>
        {/* <p>refreshKey: {refreshKey.toString()}</p> */}
        {refreshKey && (
        <div className="bulletin relative border border-gray-500 px-4 py-2 rounded-xl shadow-md">
            {error && <p>{error}</p>}
            {message && ( 
                <div >
                    {message.image && <img src={message.image.dataUrl} alt={message.image.name} />}
                    <p>{message.text}</p>
                </div>
                )
            }
            <button className="absolute top-1 right-1
                        h-8 rounded-xl px-4 py-2 text-sm text-gray
                        border border-blue-500
                        hover:shadow-md hover:shadow-blue-600/40
                        active:translate-y-px"
                    onClick={handleOnclick}
            > Delete</button>
        </div>)
        }
        </>
    );
}
