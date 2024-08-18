import moment from "moment";
import {MessageInterface} from "@/app/lib/interfaces";
import {RefObject} from "react";

interface MessageCardInterface {
    message: MessageInterface,
    hasOwnership: boolean,
    editMessage: string,
    setEditMessage: (text: string) => void,
    enableEdit: () => void,
    isEdit: boolean,
    hideProfile: boolean,
    editRef: RefObject<HTMLInputElement>,
    resendFn: (text: string) => Promise<void>
}

export default function MessageCard({message, hasOwnership, editMessage, setEditMessage, enableEdit, isEdit, hideProfile, editRef, resendFn}: MessageCardInterface) {
    const {photoURL, text, displayName, timestamp, file} = message;

    function humanFileSize(size: number) {
        let i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return +((size / Math.pow(1024, i)).toFixed(1)) + " " + ["B", "KB", "MB", "GB", "TB"][i];
    }

    return (
        <li className={"flex hover:bg-hover-d relative group " + (!hideProfile ? "mt-2" : "")}>
            {!hideProfile && <img src={photoURL} alt={displayName} className="max-w-10 max-h-10 rounded-full mx-4"/>}
            {hideProfile && <div className="w-[4.5rem]"></div>}
            <div className="flex flex-col grow">
                {!hideProfile && <span className="inline-block">
                    <span className="mr-1">{displayName}</span>
                    <span className="text-tertiary-text text-xs">{moment(timestamp.toDate()).calendar()}</span>
                </span>}
                {isEdit ?
                    <>
                        <form className="flex p-2 bg-main-text-box rounded-xl mb-2 mr-10" onSubmit={(e) => {
                            e.preventDefault();
                            resendFn(editMessage);
                        }}>
                            <input className="appearance-none outline-none bg-main-text-box grow" type="text"
                                   value={editMessage} onChange={(e) => setEditMessage(e.target.value)}
                                   ref={editRef}></input>
                            <input className="hidden" type="submit"/>
                        </form>
                        <div className="flex"></div>
                    </> :
                    <div className="flex">{text}</div>}
                <div className="flex">
                    {file && (file.type.includes("image") ?
                        <img src={file.url} alt={"image"} loading="lazy" decoding="async"
                             className="max-h-60 max-w-60 mt-2 hover:cursor-pointer object-contain"
                             style={{color: "transparent"}}/> :
                        <div className="flex bg-secondary rounded-lg min-w-60 p-2 gap-2 mt-2">
                            <img src="/icons/file.png" alt="file" className="object-contain rounded-l w-10"/>
                            <div>
                                <a className="text-blurple hover:text-blurple-hover hover:underline active:text-blurple-active" href={file.url}>{file.name}</a>
                                <p className="text-sm">{humanFileSize(file.size)}</p>
                            </div>
                        </div>)}
                </div>
            </div>
            {hasOwnership &&
                <div className="flex sm:gap-2 gap-10 absolute -top-2 right-8 invisible group-hover:visible bg-primary p-2 border border-secondary rounded-lg">
                    <img src="/icons/edit.png" alt="edit" className="w-6 h-6 hover:brightness-125 hover:cursor-pointer"
                         onClick={() => {
                             enableEdit();
                             setEditMessage(text);
                         }}/>
                    <img src="/icons/cancel.png" alt="delete" className="w-6 h-6 hover:brightness-125 hover:cursor-pointer"/>
                </div>}
        </li>
    );
}
