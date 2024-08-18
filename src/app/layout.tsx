import "./globals.css";
import {GGSans} from "../../public/fonts/fonts";
import React from "react";
import {SidebarContextProvider} from "@/app/lib/contexts";

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"/>
            <link rel="icon" type="image/x-icon" href="favicon.ico"/>
            <title>Accord</title>
        </head>
        <body className={`${GGSans.className} bg-primary bg-none text-primary-text vsc-initialized w-screen h-[calc(100svh)]`}>
        <SidebarContextProvider>
            {children}
        </SidebarContextProvider>
        </body>
        </html>
    );
}
