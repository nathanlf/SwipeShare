/* eslint-disable jsx-a11y/alt-text */
import DirectMessageHeader from "@/components/direct-message-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { CornerDownLeft, Mic, Image} from "lucide-react";
import { DiningHall } from "@/components/conversation-card";
import Message, { MessageType } from "@/components/ui/chat/message";

export default function DirectMessagePage(){
    return(
        <div className="bg-[#DCDEE5] min-h-screen w-full flex items-center justify-center flex-col">
            <DirectMessageHeader name="Sarah Smith" online={true} lastSeen={DiningHall.Lenoir}/>
            <Card className="bg-[#EFEAF6] h-[75vh] w-5/6 rounded-t-none mb-6 flex flex-col justify-between">
                <div className="flex-grow overflow-y-auto">
                    <ChatMessageList>
                        <Message type={MessageType.Sent}>
                            Hey! Are you still able to donate a swipe at Chase?
                        </Message>
                        <Message type={MessageType.Received}>
                            Yeah I am! What time would you want to meet up?
                        </Message>
                        <Message type={MessageType.Sent}>
                            I can meet at any of your scheduled times! How about 2pm? I will be there after my class
                        </Message>
                        <Message type={MessageType.Received}>
                            That works for me! See you then!
                        </Message>
                        <Message type={MessageType.Sent}>
                            Thanks for this! I will see you then.
                        </Message>
                    </ChatMessageList>
                </div>
                <div className="justify-center flex">
                    <form className="relative rounded-lg border bg-white focus-within:ring-1 focus-within:ring-ring p-0 w-11/12">
                        <ChatInput
                        placeholder="Type your message here..."
                        className="min-h-12 resize-none rounded-lg bg-white border-0 p-3 shadow-none focus-visible:ring-0 w-full"
                        />
                        <div className="flex items-center p-3 pt-0">
                            <Button variant="ghost" size="icon">
                                <Image className="size-4"/>
                                <span className="sr-only">Attach file</span>
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Mic className="size-4" />
                                <span className="sr-only">Use Microphone</span>
                            </Button>
                            <Button size="sm" className="ml-auto gap-1.5">
                                Send Message
                                <CornerDownLeft className="size-3.5" />
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    )
}