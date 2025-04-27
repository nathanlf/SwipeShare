import ConversationCard from "@/components/chat-pages/conversation-card";
import SearchBar from "@/components/search-bar";
import { Card } from "@/components/ui/card";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getConversations } from "@/utils/supabase/queries/chat";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next/dist/types";
import { useRouter } from "next/router";
import { Chat } from "@/utils/supabase/models/chat";
import { z } from "zod";
import { DiningHall } from "@/components/chat-pages/conversation-card";
import { useState } from "react";
import { useOnlineUsersContext } from "@/hooks/OnlineUsersProvider";
type ConversationPageProps = {
  user: User;
};

export default function ConversationsPage({ user }: ConversationPageProps) {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use the online users context
  const { isUserOnline } = useOnlineUsersContext();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", user.id],
    queryFn: async () => {
      return await getConversations(supabase, user.id);
    },
    enabled: !!user.id,
  });

  const handleConversationClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const getOtherUser = (conversation: z.infer<typeof Chat>) => {
    return conversation.user_1.id === user.id
      ? conversation.user_2
      : conversation.user_1;
  };

  const getLastDiningHall = () => {
    const halls = [DiningHall.Chase, DiningHall.Lenoir];
    return halls[Math.floor(Math.random() * halls.length)];
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = getOtherUser(conversation);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex justify-center items-center w-full h-full flex-col mt-4">
      <div className="flex flex-row justify-around sm:justify-between w-full sm:w-4/5 mb-1">
        <p className="text-black font-bold w-4/5 text-xl sm:text-2xl ml-4">
          Conversations
        </p>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
        />
      </div>
      <Card className="min-h-5/6 w-full sm:w-4/5 overflow-y-auto flex flex-col gap-0 bg-[#EFEAF6] p-0 rounded-2xl mb-4 max-h-[calc(100vh-120px)]">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            No conversations match your search
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            return (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <ConversationCard
                  name={otherUser.name}
                  online={isUserOnline(otherUser.id)}
                  lastSeen={getLastDiningHall()}
                  avatarUrl={otherUser.avatar_url}
                />
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: userData.user,
    },
  };
}