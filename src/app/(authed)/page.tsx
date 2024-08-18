"use client"

import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/app/firebase/config";
import InviteCard from "@/app/components/invitecard";
import {FormEvent, useContext, useState} from "react";
import {arrayUnion, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where} from "@firebase/firestore";
import {RequestInterface, UserInterface} from "@/app/lib/interfaces";
import {useCollectionData} from "react-firebase-hooks/firestore";
import {SidebarContext} from "@/app/lib/contexts";


export default function Home() {
    const [user] = useAuthState(auth);
    const [email, setEmail] = useState("");
    const sideBarState = useContext(SidebarContext);

    const sendRequest = async (e: FormEvent) => {
        e.preventDefault();
        const userQuery = query(collection(firestore, "users"), where("email", "==", email));
        const data = await getDocs(userQuery);

        if (data.docs.length) {
            const {uid: receiverUID, displayName: receiverDisplayName} = data.docs[0].data() as UserInterface;
            const {uid: senderUID, displayName: senderDisplayName} = user!;
            const docData = {
                senderUID,
                senderDisplayName,
                receiverUID,
                receiverDisplayName
            } as RequestInterface;
            await setDoc(doc(firestore, "requests", `${senderUID}-${receiverUID}`), docData);
        }
    }

    const [incomingRequests] = useCollectionData(query(collection(firestore, "requests"), where("receiverUID", "==", user?.uid!)));
    const [outgoingRequests] = useCollectionData(query(collection(firestore, "requests"), where("senderUID", "==", user?.uid!)));

    const acceptRequest = async (senderUID: string, receiverUID: string) => {
        await deleteDoc(doc(firestore, "requests", `${senderUID}-${receiverUID}`));
        await updateDoc(doc(firestore, "users", senderUID), {friends: arrayUnion(receiverUID)});
        await updateDoc(doc(firestore, "users", receiverUID), {friends: arrayUnion(senderUID)});
    }

    const rejectRequest = async (senderUID: string, receiverUID: string) => {
        await deleteDoc(doc(firestore, "requests", `${senderUID}-${receiverUID}`));
    }

    return (
        <div className="h-full flex flex-col grow p-4 gap-2 mt-4 sm:mt-0">
            <button className="absolute top-0 left-0 group sm:hidden" onClick={() => sideBarState.setIsOpen(true)}>
                <img src="/icons/left-arrow.png" alt="back" className="w-6 h-6 htoup-hover:brightness-125"/>
            </button>

            <article className="flex flex-col gap-2 mb-2">
                <h2 className="font-semibold mx-auto sm:mx-0">ADD FRIEND</h2>
                <p className="text-tertiary-text text-sm mx-auto sm:mx-0">You can add friends with their account email.</p>
                <form className="flex flex-col sm:flex-row sm:bg-tertiary rounded-lg" onSubmit={(e) => sendRequest(e)}>
                    <input className="outline-none bg-tertiary flex grow rounded m-2 p-2"
                           placeholder="You can add friends with their account email." type="email" value={email}
                           onChange={(e) => setEmail(e.target.value)}/>
                    <button className="bg-blurple hover:bg-blurple-hover active:bg-blurple-active disabled:bg-blurple-active text-white p-2 rounded m-2 text-sm font-semibold">
                        <span className="flex align-top justify-center gap-1 text-white">Send Friend Request</span>
                    </button>
                </form>
            </article>
            <hr className="text-active-l rounded-full"/>
            <h2 className="font-semibold">INCOMING INVITES</h2>
            <ol>
                {
                    incomingRequests?.map((data) => {
                        const {senderDisplayName, senderUID} = data as RequestInterface;

                        return <InviteCard key={senderUID} displayName={senderDisplayName} uid={senderUID}
                                           incoming={true} accept={() => acceptRequest(senderUID, user?.uid!)}
                                           reject={() => rejectRequest(senderUID, user?.uid!)}></InviteCard>;
                    })
                }
            </ol>
            <hr className="text-active-l rounded-full"/>
            <h2 className="font-semibold">OUTGOING INVITES</h2>
            <ol>
                {
                    outgoingRequests?.map((data) => {
                        const {receiverDisplayName, receiverUID} = data as RequestInterface;

                        return <InviteCard key={receiverUID} displayName={receiverDisplayName} uid={receiverUID}
                                           incoming={false}
                                           reject={() => rejectRequest(user?.uid!, receiverUID)}></InviteCard>;
                    })
                }
            </ol>
        </div>
    );
}
