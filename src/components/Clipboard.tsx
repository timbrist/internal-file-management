import { useEffect, useState } from "react";



export default function Clipboard(){
    //handle text 
    const [text, setText] = useState("");

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

        const data = await res.json();
        console.log("server response:", data);
    };

    return (
        <div className="flex flex-col items-center w-150 border border-gray-500 rounded-xl shadow-md">
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
            <div className="flex gap-2.5 w-full ">
                <textarea 
                    onChange={(e)=>{setText(e.target.value)}}
                    onPaste={handlePaste} placeholder="Message..." 
                    className="h-28 flex-1 resize-none bg-transparent px-1.5 py-2 text-base leading-[22px] outline-none">
                </textarea>
                <button 
                    onClick={()=>handleSubmit({text,image})}
                    className="
                        h-8 rounded-xl px-4 py-2 text-sm font-semibold text-gray
                        hover:shadow-md hover:shadow-blue-600/40
                        active:translate-y-px
                    "
                    >
                    Send
                </button>
            </div>
        </div>
    );
}