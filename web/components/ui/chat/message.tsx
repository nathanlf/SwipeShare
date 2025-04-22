import { ReactNode } from "react"
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "./chat-bubble"

export enum MessageType {
    Sent = "sent",
    Received = 'received'
}

type MessageProps = {
    type: MessageType
    children: ReactNode
}

export default function Message({ type, children}: MessageProps){
        const messageClasses = type === MessageType.Sent
        ? "bg-[#A07fb4] text-white" 
        : "bg-gray-100 text-gray-800"; 
        const fallback = type === MessageType.Sent
        ? "ME" 
        : "SS"; 
    return(
        <ChatBubble variant={type} >
            <ChatBubbleAvatar fallback={fallback}/>
            <ChatBubbleMessage className={messageClasses}>
                {children}
            </ChatBubbleMessage>
        </ChatBubble>
    )
}