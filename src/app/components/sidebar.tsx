import {auth, firestore} from "@/app/firebase/config";
import {useAuthState} from "react-firebase-hooks/auth";
import {useDocumentData} from "react-firebase-hooks/firestore";
import {arrayRemove, doc, updateDoc} from "@firebase/firestore";
import {UserInterface} from "@/app/lib/interfaces";
import {signOut} from "firebase/auth";
import {useRouter, useSearchParams} from "next/navigation";
import {useContext} from "react";
import {SidebarContext} from "@/app/lib/contexts";

export default function SideBar() {
    const [user] = useAuthState(auth);
    const [userData] = useDocumentData(doc(firestore, "users", user?.uid!));
    const router = useRouter();
    const sideBarState = useContext(SidebarContext);

    return (
        <div className="w-full h-full">
            <button className="absolute top-0 left-0 group sm:hidden" onClick={() => sideBarState.setIsOpen(!sideBarState.isOpen)}>
                <img src="/icons/left-arrow.png" alt="back" className="w-6 h-6 htoup-hover:brightness-125"/>
            </button>

            <aside className="flex flex-col bg-secondary w-full h-full">
                <header className="border-tertiary border-b h-10 min-h-10">
                    <a className="flex items-center justify-center p-2 hover:bg-hover-l active:bg-active-l text-tertiary-text hover:text-secondary-text active:text-white "
                       href="/"
                       onClick={() => sideBarState.setIsOpen(false)}>
                        <img src="/icons/invite.png" alt="invite" className="w-6 h-6 mr-3"/>
                        <p>Invites</p>
                    </a>
                </header>

                <div className="flex flex-col grow gap-1 p-4">
                    <h4 className="text-xs font-mono text-tertiary-text">DIRECT MESSAGES</h4>
                    <div className="flex flex-col gap-0.5 overflow-y-auto">
                        {(userData as UserInterface)?.friends?.map((uid) => <FriendCard key={uid} uid={uid}></FriendCard>)}
                    </div>
                </div>

                <button className="bg-blurple hover:bg-blurple-hover active:bg-blurple-active disabled:bg-blurple-active text-white p-2 rounded px-4 py-1 m-4"
                    onClick={() => {
                        router.push("/login");
                        signOut(auth);
                    }} type="button">
                    <span className="flex align-top justify-center gap-1 text-white">Log Out</span>
                </button>
            </aside>
        </div>
    );
}

function FriendCard({uid}: { uid: string }) {
    const [user] = useAuthState(auth);
    const [friendData] = useDocumentData(doc(firestore, "users", uid));
    const friend = friendData as UserInterface;
    const sideBarState = useContext(SidebarContext);

    const removeFriend = async () => {
        await updateDoc(doc(firestore, "users", user?.uid!), {friends: arrayRemove(uid)});
        await updateDoc(doc(firestore, "users", uid), {friends: arrayRemove(user?.uid!)});
    }

    return (
        <a className={"group flex justify-between items-center text-left rounded p-2 hover:bg-hover-l active:bg-active-l text-tertiary-text hover:text-secondary-text active:text-white " + (useSearchParams().get("id") == uid ? "bg-active-l text-white" : "")}
           href={`/dm?id=${uid}`}
           onClick={() => sideBarState.setIsOpen(false)}>
            <article className="flex items-center">
                <img className="max-w-9 max-h-9 rounded-full mr-3 my-auto" src={friend?.photoURL} alt={friend?.displayName}/>
                <p>{friend?.displayName}</p>
            </article>
            <img src="/icons/cancel.png" alt="Remove Friend"
                 className="sm:invisible group-hover:visible w-5 h-5 hover:brightness-125" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFriend();
            }}/>
        </a>
    );
}
