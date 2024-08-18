"use client"

import {createContext, useState} from "react";

export const SidebarContext = createContext({
    isOpen: true,
    setIsOpen: (isOpen: boolean) => {
    }
})

export function SidebarContextProvider(props: any) {

    const [isOpen, setIsOpen] = useState(true);

    const initState = {
        isOpen, setIsOpen
    };

    return (
        <SidebarContext.Provider value={initState}>
            {props.children}
        </SidebarContext.Provider>
    );
}
