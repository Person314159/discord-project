"use client";

import React, {useContext, useEffect, useState} from "react";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";

import {useRouter} from "next/navigation";
import SideBar from "@/app/components/sidebar";
import {Transition} from "@headlessui/react";
import {SidebarContext} from "@/app/lib/contexts";

export default function AuthLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const sideBarState = useContext(SidebarContext);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (!user && !loading) router.push("/login");
    }, [user, loading, router]);

    useEffect(() => {
        const mediaQuery = () => setIsMobile(!window.matchMedia("(min-width:640px)").matches)
        window.addEventListener("resize", mediaQuery);
        return () => window.removeEventListener("resize", mediaQuery);
    });

    return !loading && user && (
        <main className="flex flex-row items-center justify-between h-full">
            <Transition show={sideBarState.isOpen || !isMobile}
                        className="w-full h-full fixed sm:w-3/12 sm:min-w-60 sm:max-w-80 sm:static top-0 z-10 transition duration-150 ease-in-out data-[closed]:-translate-x-full"
                        as="div">
                <SideBar/>
            </Transition>
            {children}
        </main>
    );
}
