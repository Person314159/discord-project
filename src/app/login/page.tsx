"use client"

import {useSignInWithEmailAndPassword, useSignInWithGoogle} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/app/firebase/config";
import Button from "@/app/components/button";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {doc, setDoc} from "@firebase/firestore";
import {UserInterface} from "@/app/lib/interfaces";

export default function Login() {
    const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
    const [signInWithEmailAndPassword, , supLoading, supError] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();

    const googleSignIn = async () => {
        const cred = await signInWithGoogle();
        const {uid, displayName, photoURL, email} = cred?.user!;
        const docData = {uid, displayName, photoURL, email} as UserInterface;

        await setDoc(doc(firestore, "users", uid), docData, {merge: true});

        if (cred) router.push("/");
    }

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [noEmail, setNoEmail] = useState(false);
    const [noPassword, setNoPassword] = useState(false);

    const usernameAndPasswordSignIn = async () => {
        if (email === "") setNoEmail(true);
        else setNoEmail(false);

        if (password === "") setNoPassword(true);
        else setNoPassword(false);

        if (noEmail || noPassword) return;

        const cred = await signInWithEmailAndPassword(email, password);

        if (cred) router.push("/");
    }

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-4/5 max-w-4xl p-12 rounded sm:shadow-md sm:bg-drawer">
                <h2 className="mb-4 text-4xl font-bold text-center flex justify-center items-center">Accord</h2>
                <div className="mb-5">
                    <div>
                        <label className={"uppercase font-semibold text-sm mb-2 " + (noEmail ? "text-[#f42f33]" : "")}>Email</label>
                        {!noEmail && <span className="pl-1 text-[#f23f42]">*</span>}
                        {noEmail && <span className="pl-1 italic text-sm text-[#f42f33]">- Required</span>}
                    </div>
                    <div>
                        <input type="text"
                               className="rounded-[4px] box-border w-full bg-secondary text-base p-2.5" value={email}
                               onChange={(e) => setEmail(e.target.value)} required></input>
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
                               className="rounded-[4px] box-border w-full bg-secondary text-base p-2.5" value={password}
                               onChange={(e) => setPassword(e.target.value)} required></input>
                    </div>

                    <Button text="Sign in" onClick={() => usernameAndPasswordSignIn()} loading={supLoading}/>
                    {supError && <p className="text-center text-sm text-warning">Sign in failed, please try again</p>}

                    <div className="mt-1">
                        <span className="text-center text-sm">Need an account?</span>
                        <a className="pl-1 text-[#0064f8]" href="/register">Register</a>
                    </div>
                </div>
                <p className="text-center m-4">Or</p>
                <Button text="Sign in with Google" onClick={() => googleSignIn()} loading={googleLoading}/>
                {googleError && <p className="text-center text-sm text-warning">{googleError.message}</p>}
            </div>
        </div>
    )
}
