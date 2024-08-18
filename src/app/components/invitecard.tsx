import {useDocumentData} from "react-firebase-hooks/firestore";
import {doc} from "@firebase/firestore";
import {firestore} from "@/app/firebase/config";
import {UserInterface} from "@/app/lib/interfaces";

interface InviteCard {
    displayName: string,
    uid: string,
    incoming: boolean,
    accept?: () => any,
    reject: () => any,
}

export default function InviteCard({displayName, uid, incoming, accept, reject}: InviteCard) {
    const [userData] = useDocumentData(doc(firestore, "users", uid));

    return (
        <li className="flex my-2 justify-between">
            <section className="flex items-center">
                <img src={(userData as UserInterface)?.photoURL} alt={displayName} className="max-w-9 max-h-9 rounded-full mr-3"/>
                <div>
                    <p>{displayName}</p>
                    <p className="text-tertiary-text text-xs">{(userData as UserInterface)?.email}</p>
                </div>
            </section>
            <div className="flex gap-2">
                {incoming ?
                    <button onClick={accept} className="group w-10 bg-secondary rounded-full">
                        <img src="/icons/add.png" alt="add" className="w-6 m-auto group-hover:brightness-125"/>
                    </button> : undefined}
                <button onClick={reject} className="group w-10 bg-secondary rounded-full">
                    <img src="/icons/cancel.png" alt="cancel" className="w-6 m-auto group-hover:brightness-125"/>
                </button>
            </div>
        </li>
    );
}
