"use client"

import {useCreateUserWithEmailAndPassword, useSignInWithGoogle} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/app/firebase/config";
import Button from "@/app/components/button";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {doc, setDoc} from "@firebase/firestore";
import {UserInterface} from "@/app/lib/interfaces";

export default function Register() {
    const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
    const [createUserWithEmailAndPassword, , cupLoading, cupError] = useCreateUserWithEmailAndPassword(auth);
    const router = useRouter();

    const googleSignIn = async () => {
        const cred = await signInWithGoogle();
        const {uid, displayName, photoURL, email} = cred?.user!;
        const docData = {uid, displayName, photoURL, email} as UserInterface;

        await setDoc(doc(firestore, "users", uid), docData, {merge: true});

        if (cred) router.push("/");
    }

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [noEmail, setNoEmail] = useState(false);
    const [noDisplayName, setNoDisplayName] = useState(false);
    const [noPassword, setNoPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const DEFAULTPHOTOURL = "https://ia600305.us.archive.org/31/items/discordprofilepictures/discordblue.png";

    const usernameAndPasswordCreate = async () => {
        if (email === "") setNoEmail(true);
        else setNoEmail(false);

        if (displayName === "") setNoDisplayName(true);
        else setNoDisplayName(false);

        if (password === "") setNoPassword(true);
        else setNoPassword(false);

        if (noEmail || noDisplayName || noPassword) return;

        const cred = await createUserWithEmailAndPassword(email, password);

        if (cupError) {
            switch (cupError.code) {
                case "auth/email-already-in-use":
                    setErrorMessage("Email already exists.");
                    break;
                case "auth/invalid-email":
                    setErrorMessage("Email is not valid.");
                    break;
                case "auth/invalid-password":
                    setErrorMessage("Invalid password.");
                    break;
                case "auth/weak-password":
                    setErrorMessage("Password should be at least 6 characters.");
                    break;
                default:
                    setErrorMessage(cupError.message);
            }
        }

        const {uid} = cred?.user!;
        const docData = {uid, displayName, photoURL: DEFAULTPHOTOURL, email} as UserInterface;
        await setDoc(doc(firestore, "users", uid), docData, {merge: true});

        if (cred) router.push("/");
    }

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-4/5 max-w-4xl p-12 rounded shadow-md bg-drawer">
                <h2 className="mb-4 text-4xl font-bold text-center flex justify-center items-center">Accord</h2>
                <div className="mb-5">
                    <div>
                        <label className={"uppercase font-semibold text-sm mb-2 " + (noEmail ? "text-[#f42f33]" : "")}>Email</label>
                        {!noEmail && <span className="pl-1 text-[#f23f42]">*</span>}
                        {noEmail && <span className="pl-1 italic text-sm text-[#f42f33]">- Required</span>}
                    </div>
                    <div>
                        <input type="text"
                               className="rounded-[4px] box-border w-full bg-primary text-base p-2.5" value={email}
                               onChange={(e) => setEmail(e.target.value)} required></input>
                    </div>
                </div>
                <div className="mb-5">
                    <div>
                        <label className={"uppercase font-semibold text-sm mb-2 " + (noDisplayName ? "text-[#f42f33]" : "")}>Display Name</label>
                        {!noDisplayName && <span className="pl-1 text-[#f23f42]">*</span>}
                        {noDisplayName && <span className="pl-1 italic text-sm text-[#f42f33]">- Required</span>}
                    </div>
                    <div>
                        <input type="text"
                               className="rounded-[4px] box-border w-full bg-primary text-base p-2.5"
                               value={displayName}
                               onChange={(e) => setDisplayName(e.target.value)} required></input>
                    </div>
                </div>
                <div>
                    <div>
                        <label className={"uppercase font-semibold text-sm mb-2 " + (noPassword ? "text-[#f42f33]" : "")}>Password</label>
                        {!noPassword && <span className="pl-1 text-[#f23f42]">*</span>}
                        {noPassword && <span className="pl-1 italic text-sm text-[#f42f33]">- Required</span>}
                    </div>
                    <div className="mb-5">
                        <input type="password"
                               className="rounded-[4px] box-border w-full bg-primary text-base p-2.5" value={password}
                               onChange={(e) => setPassword(e.target.value)} required></input>
                    </div>

                    <Button text="Register" onClick={() => usernameAndPasswordCreate()} loading={cupLoading}></Button>
                    {cupError && <p className="text-center text-sm text-warning">{errorMessage}</p>}
                </div>
                <p className="text-center m-4">Or</p>
                <Button text="Sign in with Google" onClick={() => googleSignIn()} loading={googleLoading}></Button>
                {googleError && <p className="text-center text-sm text-warning">Sign in failed, please try again</p>}
            </div>
        </div>
    );
}
