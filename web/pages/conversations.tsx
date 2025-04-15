import ConversationCard from "@/components/conversation-card";
import { DiningHall } from "@/components/conversation-card";
import SearchBar from "@/components/search-bar";
import { Card } from "@/components/ui/card";
export default function ConversationsPage(){
    const conversations = [
    { id: 1, name: "Sarah Smith", online: true, lastSeen: DiningHall.Chase },
    { id: 2, name: "Derrick Jones", online: false, lastSeen: DiningHall.Lenoir },
    { id: 3, name: "Samuel Ketes", online: true, lastSeen: DiningHall.Chase },
    { id: 4, name: "Jessica Brown", online: false, lastSeen: DiningHall.Chase },
    { id: 5, name: "Michael Taylor", online: true, lastSeen: DiningHall.Lenoir },
    { id: 6, name: "Emma Wilson", online: true, lastSeen: DiningHall.Chase },
    { id: 7, name: "David Miller", online: false, lastSeen: DiningHall.Chase },
    { id: 8, name: "Olivia Davis", online: true, lastSeen: DiningHall.Lenoir },
    { id: 9, name: "James Johnson", online: true, lastSeen: DiningHall.Chase },
    { id: 10, name: "Sophia Martin", online: false, lastSeen: DiningHall.Chase },
    { id: 11, name: "Benjamin Clark", online: true, lastSeen: DiningHall.Lenoir },
  ];
    return(
        <div className="flex justify-start items-center w-full h-full flex-col">
            <div className="flex flex-row justify-between w-4/5 mb-1">
                <p className="text-black font-bold w-4/5 text-lg sm:text-2xl">
                Conversations
                </p>     
                <SearchBar></SearchBar>
            </div>
            <Card className="min-h-5/6 w-4/5 overflow-y-auto flex flex-col gap-0 bg-[#EFEAF6] p-0 rounded-2xl mb-4 max-h-[calc(100vh-120px)]">
                {conversations.map((conversation) => (
                    <ConversationCard
                        key={conversation.id}
                        name={conversation.name}
                        online={conversation.online}
                        lastSeen={conversation.lastSeen}
                    />
                ))}
            </Card>
        </div>
    )
}