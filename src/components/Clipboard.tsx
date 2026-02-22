import { useEffect, useState } from "react";



export default function Clipboard(){
    //TODO : Allow to paste image and have a preview image.

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

    return (
        <div className="clipboard">
            {previewUrl && 
                <div className="image-preview">
                    <img src={previewUrl} />
                    <button onClick={() => setImage(null)}>Remove</button>
                </div>
            }
            <textarea onPaste={handlePaste} placeholder="Message...">
            </textarea>
            <button> Send </button>
        </div>
    );
}