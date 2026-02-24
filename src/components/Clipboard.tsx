import { useEffect, useState, type ChangeEvent } from "react";
import type { ChatMsg } from "../App";



export default function Clipboard( {onSent}:{onSent:(savedMessage: ChatMsg)=>void}){
    //handle text 
    const [text, setText] = useState("");
    const [error, setError] = useState("");

    //Allow to paste image and have a preview image.
    const [image, setImage] = useState<File |null>(null);
    const [previewUrl, setPreviewUrl] = useState<string|null>(null);

    const handlePaste:React.ClipboardEventHandler<HTMLTextAreaElement> = (e)=>{
        console.log("catch paste event");
        
        const items = e.clipboardData?.items;
        if(!items)  return;

        for(const item of Array.from(items)){
            if(item.kind === "file"){
                const file = item.getAsFile();

                //try to get only the image file
                if (file && file.type.startsWith("image/")) {
                    e.preventDefault();
                    setImage(file); 
                    return;
                }
            }
        }
    };

    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            e.target.value = "";
            return;
        }
        setImage(file);
    };

    //whenever image changes, call this effect
    useEffect( ()=>{
        // Create / cleanup preview URL
        if(!image){ setPreviewUrl(null); return;}

        const url = URL.createObjectURL(image);
        setPreviewUrl(url);
        console.log("the preview image:", url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    

    //send the text and image to the sever
    const handleSubmit = async ({ text, image }: { text: string; image: File | null }) => {
        const fd = new FormData();
        fd.append("text", text);
        if (image) fd.append("image", image);
        const res = await fetch("/api/message", {
            method: "POST",
            body: fd,
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Upload failed");
        }

        const data: ChatMsg = await res.json();
        console.log("server response:", data);
        setText("");
        setImage(null);
        setError("");
        return data;
    };

    const handleSend = async () => {
        try {
            const savedMessage = await handleSubmit({ text, image });
            onSent(savedMessage);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        }
    };

    return (
        <div className="clipboard flex flex-col items-center w-[80vw] border border-gray-500 rounded-xl shadow-md">
            {error && <p>{error}</p>}
            <div className="relative ">
                {previewUrl && 
                    <div className="image-preview">
                        <img src={previewUrl} />
                        <button className="absolute right-1 top-1    
                        bg-white text-gray h-8 rounded-xl px-4 py-2 text-sm
                        hover:shadow-md hover:shadow-blue-600/40
                        active:translate-y-px"
                            onClick={() => setImage(null)}>Remove</button>
                    </div>
                }
            </div>
            <div className="relative flex gap-2.5 w-full ">
                <textarea 
                    value={text}
                    onChange={(e)=>{setText(e.target.value)}}
                    onPaste={handlePaste} placeholder="Message..." 
                    className="h-28 flex-1 resize-none bg-transparent px-1.5 py-2 text-base leading-[22px] outline-none">
                </textarea>
                <button 
                    onClick={handleSend}
                    className="
                        h-8 rounded-xl px-4 py-2 text-sm font-semibold text-gray
                        hover:shadow-md hover:shadow-blue-600/40
                        active:translate-y-px
                    "
                    >
                    Send
                </button>
                <input
                    id="upload-image"
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                />
                <label
                    htmlFor="upload-image"
                    className="absolute bottom-2 left-2 cursor-pointer
                        h-8 rounded-xl px-4 py-2 text-sm font-semibold text-gray
                        hover:shadow-md hover:shadow-blue-600/40
                        active:translate-y-px"
                >
                    +
                </label>
            </div>
        </div>
    );
}
