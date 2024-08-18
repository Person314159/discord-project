"use client"

import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore, storage} from "@/app/firebase/config";
import {useSearchParams} from "next/navigation";
import {createRef, FormEvent, RefObject, useContext, useEffect, useRef, useState} from "react";
import {addDoc, collection, doc, DocumentData, orderBy, query, serverTimestamp, SnapshotOptions, updateDoc} from "@firebase/firestore";
import {useCollection, useDocumentData} from "react-firebase-hooks/firestore";
import MessageCard from "@/app/components/messagecard";
import {MessageInterface, UserInterface} from "@/app/lib/interfaces";
import {useUploadFile} from "react-firebase-hooks/storage";
import {getDownloadURL, ref} from "@firebase/storage";
import {SidebarContext} from "@/app/lib/contexts";


export default function DM() {
    const [user] = useAuthState(auth);
    const [userData] = useDocumentData(doc(firestore, "users", user?.uid!));
    const searchParams = useSearchParams();
    const friendUID = searchParams.get("id");
    const [friendData] = useDocumentData(doc(firestore, "users", friendUID!));
    const friend = friendData as UserInterface;
    const dmID = [friendUID!, user?.uid!].toSorted().join("-");
    const textBox = createRef<HTMLInputElement>();
    const sideBarState = useContext(SidebarContext);
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | undefined>(undefined);
    const [uploadFile] = useUploadFile();
    const [editMessage, setEditMessage] = useState("");
    const [editMessageId, setEditMessageId] = useState("");
    const editBoxes = useRef<Map<string, RefObject<HTMLInputElement>>>(new Map());
    const MESSAGE_BUNCHING_TIME = 30;

    const [messages] = useCollection(query(collection(firestore, "dm", dmID, "messages"), orderBy("timestamp", "desc")));

    const sendMessage = async (event: FormEvent) => {
        event.preventDefault();
        setText("");

        const doc = {
            uid: user?.uid!,
            text: text,
            timestamp: serverTimestamp(),
            displayName: (userData as UserInterface)?.displayName,
            photoURL: (userData as UserInterface)?.photoURL,
            edited: false
        } as MessageInterface;

        if (file) {
            const type = file.type.includes("image") ? "image" : "file";
            const path = `${type}/${dmID}/${Date.now()}/${file.name}`;
            await uploadFile(ref(storage, path), file);
            setFile(undefined);
            const url = await getDownloadURL(ref(storage, path));
            doc.file = {url, type, name: file.name, size: file.size};
        }

        if (text.length || file) await addDoc(collection(firestore, "dm", dmID, "messages"), doc);
    }

    const resendMessage = async (text: string, mUID: string, mData: DocumentData) => {
        await updateDoc(doc(firestore, "dm", dmID, "messages", mUID), {...mData, text, edited: true});
        setEditMessageId("");
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            editMessageId ? editBoxes.current.get(editMessageId)?.current?.focus() : textBox.current?.focus();

            if (e.key === "Escape" && editMessageId) setEditMessageId("");
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    return (
        <article className="h-full w-full flex flex-col grow">
            <header className="border-tertiary border-b h-10 min-h-10 flex items-center pl-10 sm:pl-5">
                <button className="absolute top-0 left-0 group sm:hidden" onClick={() => sideBarState.setIsOpen(!sideBarState.isOpen)}>
                    <img src="/icons/left-arrow.png" alt="back" className="w-6 h-6 htoup-hover:brightness-125"/>
                </button>

                <img src={friend?.photoURL!} alt={friend?.displayName!} className="h-6 w-6 rounded-full mr-3 my-auto"/>
                <p>{friend?.displayName!}</p>
            </header>

            <ol className="flex flex-col-reverse flex-grow overflow-y-auto">
                {
                    messages?.docs.map((doc, i, messages) => {
                        const ref = createRef<HTMLInputElement>();
                        editBoxes.current.set(doc.id, ref);
                        const options = {serverTimestamps: "estimate"} as SnapshotOptions;
                        const message = doc.data(options) as MessageInterface;
                        const successiveMessage = i === messages.length - 1 || (message?.timestamp?.seconds - messages[i + 1].data(options)?.timestamp?.seconds) < MESSAGE_BUNCHING_TIME;
                        const sameUser = messages[i + 1]?.data(options)?.uid == message?.uid;
                        let hideProfile = successiveMessage && sameUser;
                        const mUID = doc.id;
                        return <MessageCard key={mUID} message={message} hasOwnership={user?.uid! === message.uid}
                                            hideProfile={hideProfile} editRef={ref}
                                            resendFn={(text) => resendMessage(text, mUID, message)}
                                            editMessage={editMessage} setEditMessage={setEditMessage}
                                            enableEdit={() => setEditMessageId(editMessageId === mUID ? "" : mUID)}
                                            isEdit={editMessageId === mUID}></MessageCard>
                    })
                }
            </ol>

            <section className="flex flex-col mx-4 mb-4 mt-4 bg-main-text-box rounded-xl">
                {file && <FileBox file={file}/>}
                <form className="flex p-2" onSubmit={sendMessage}>
                    <label htmlFor="upload" className="mr-2 group hover:cursor-pointer">
                        <img src="/icons/upload.png" alt="Upload" className="w-6 h-6 group-hover:brightness-125"/>
                    </label>
                    <input type="file" className="hidden" id="upload" onChange={(e) => {
                        setFile(e.target.files?.[0]);
                        e.target.value = "";
                    }}></input>
                    <input className="appearance-none outline-none bg-main-text-box flex grow"
                           ref={textBox}
                           placeholder={"Message " + friend?.displayName!} type="text" value={text} onChange={(e) => setText(e.target.value)}></input>
                </form>
            </section>
        </article>
    );
}

function FileBox({file}: { file: File }) {
    function deleteAttachment() {

    }

    return (
        <>
            <div className="w-72 h-72 rounded-xl m-4 bg-primary flex flex-col justify-center items-center relative">
                <button className="group">
                    <img src="/icons/bin.png" alt="bin"
                         className="w-6 h-6 absolute top-0 right-0 -m-2 group-hover:scale-110"
                         onClick={deleteAttachment}/>
                </button>
                {<img src={file.type.includes("image") ? URL.createObjectURL(file) : "/icons/file.png"} alt={file.name}
                      className={file.type.includes("image") ? "object-contain rounded-xl w-60 h-60 m-2 bg-line" : "object-contain rounded-xl w-24 h-24 m-20 bg-line"}/>}
                <p>{file.name}</p>
            </div>
            <hr className="text-line rounded-full mx-2"></hr>
        </>
    )
}
