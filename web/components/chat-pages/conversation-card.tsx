import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Message } from "@/utils/supabase/models/message";
import { format, isToday, isYesterday, isThisWeek, differenceInDays } from "date-fns";

export enum DiningHall {
  Lenoir = "Lenoir",
  Chase = "Chase",
}

type ConversationCardProps = {
    name: string,
    online: boolean,
    avatarUrl?: string | null,
    lastMessage?: z.infer<typeof Message> | null
}

export default function ConversationCard({
    name, 
    online, 
    avatarUrl, 
    lastMessage
}: ConversationCardProps) {
    const formatTimestamp = (timestamp: string | Date) => {
        const messageDate = new Date(timestamp);
        
        if (isToday(messageDate)) {
            return format(messageDate, "h:mm a");
        } 
        else if (isYesterday(messageDate)) {
            return "yesterday";
        } 
        else if (isThisWeek(messageDate) && differenceInDays(new Date(), messageDate) < 7) {
            return format(messageDate, "EEEE"); // EEEE gives full day name
        } 
        else {
            return format(messageDate, "MM/dd/yy");
        }
    };
    
    const formattedTime = lastMessage?.created_at 
        ? formatTimestamp(lastMessage.created_at)
        : "";

    return (
        <Card className="rounded-none w-full h-20 flex justify-center hover:bg-slate-100 hover:translate-y-[-3px] transition-transform duration-100 ease-in-out cursor-pointer">
            <CardContent className="py-2">
                <div className="flex flex-row justify-start items-center">
                    <Avatar className="ml-1">
                        <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} alt={name} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-row w-full justify-between">
                        <div className="flex flex-col ml-4">
                            <p className="font-bold text-lg">{name}</p>
                            {lastMessage && (
                                <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[500px]">
                                    {lastMessage.content}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <p className={`text-xs ${online ? 'text-green-600' : 'text-red-600'}`}>
                                {online ? 'Online' : 'Offline'}
                            </p>
                            {lastMessage && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {formattedTime}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
