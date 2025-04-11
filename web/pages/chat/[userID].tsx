import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { CornerDownLeft, Mic, Paperclip, UtensilsCrossed } from "lucide-react";

export default function DirectMessagePage(){
    return(
        <div className="bg-[#DCDEE5] min-h-screen w-full flex items-center justify-center flex-col">
            <Card className="rounded-b-none w-5/6 mt-[-3rem] h-20 flex justify-center">
                <CardContent className="py-2">
                    <div className="flex flex-row justify-start items-center">
                        <Avatar className="ml-1">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col ml-4">
                            <p className="font-bold text-base text-sm">Sarah Smith</p>
                            <p className="text-xs text-green-600">Online</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="inline-block"><UtensilsCrossed /></span> Last seen at Lenoir
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#EFEAF6] h-[75vh] w-5/6 rounded-t-none mb-6 flex flex-col justify-between">
                <div className="flex-grow overflow-y-auto">
                    <ChatMessageList>
                        {/* add chat messages chat-bubble */}
                    </ChatMessageList>
                </div>
                <div className="justify-center flex">
                    <form
                        className="relative rounded-lg border bg-white focus-within:ring-1 focus-within:ring-ring p-0 w-11/12"
                    >
                        <ChatInput
                        placeholder="Type your message here..."
                        className="min-h-12 resize-none rounded-lg bg-white border-0 p-3 shadow-none focus-visible:ring-0 w-full"
                        />
                        <div className="flex items-center p-3 pt-0">
                            <Button variant="ghost" size="icon">
                                <Paperclip className="size-4" />
                                <span className="sr-only">Attach file</span>
                            </Button>

                            <Button variant="ghost" size="icon">
                                <Mic className="size-4" />
                                <span className="sr-only">Use Microphone</span>
                            </Button>

                            <Button
                                size="sm"
                                className="ml-auto gap-1.5"
                            >
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