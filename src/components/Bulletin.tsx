import type { ChatMsg } from "../App";

export default function Bulletin(
    { message, refreshTick, error, onDelete }:{
        message: ChatMsg | null;
        refreshTick: number;
        error: string;
        onDelete: () => Promise<void>;
    }
){
    const handleOnclick = async () =>{
        await onDelete();
    };

    return(
        <div data-refresh-tick={refreshTick} className="bulletin relative w-[80vw] border border-gray-500 px-4 py-2 rounded-xl shadow-md">
            {error && <p>{error}</p>}
            {message && (

                <div >
                    {message.image && <img src={message.image.dataUrl} alt={message.image.name} />}
                    <p>{message.text}</p>
                </div>
            )}                
                <button className="absolute top-1 right-1
                            h-8 rounded-xl px-4 py-2 text-sm text-gray
                            border border-blue-500
                            hover:shadow-md hover:shadow-blue-600/40
                            active:translate-y-px"
                        onClick={handleOnclick}
                > Delete</button>


        </div>
    );
}
