import {Timestamp} from "@firebase/firestore";

export interface MessageInterface {
    uid: string,
    text: string,
    timestamp: Timestamp,
    displayName: string,
    photoURL: string,
    file?: AttachmentInterface,
    edited?: boolean
}

export interface AttachmentInterface {
    url: string,
    type: "file" | "image",
    name: string,
    size: number
}

export interface UserInterface {
    uid: string,
    displayName: string,
    photoURL: string,
    email: string,
    friends: string[]
}

export interface RequestInterface {
    senderUID: string,
    senderDisplayName: string,
    receiverUID: string,
    receiverDisplayName: string
}
