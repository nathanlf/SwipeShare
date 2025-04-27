import { UtensilsCrossed } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { DiningHall } from "./conversation-card";

type DirectMessageHeaderProps = {
  name: string;
  online: boolean;
  lastSeen?: DiningHall;
};

export default function DirectMessageHeader({
  name,
  online,
  lastSeen,
}: DirectMessageHeaderProps) {
  return (
    <Card className="rounded-b-none w-full sm:w-5/6 mt-6 h-20 flex justify-center">
      <CardContent className="py-2">
        <div className="flex flex-row justify-start items-center">
          <Avatar className="ml-1">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-4">
            <p className="font-bold text-base text-sm">{name}</p>
            <p
              className={`text-xs ${online ? "text-green-600" : "text-red-600"}`}
            >
              {online ? "Online" : "Offline"}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-block">
                <UtensilsCrossed />
              </span>{" "}
              Last seen at {lastSeen}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
