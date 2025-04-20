/* eslint-disable jsx-a11y/alt-text */

import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { getChatById, getUsersInChat } from "@/utils/supabase/queries/chat";
import { getMessages, sendMessage } from "@/utils/supabase/queries/message";
import { addMessageToCacheFn, updateMessageInCacheFn, deleteMessageFromCacheFn } from "@/utils/supabase/cache/message-cache";
import { z } from "zod";
import { DraftMessage } from "@/utils/supabase/models/message";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import Message, { MessageType } from "@/components/ui/chat/message";
import DirectMessageHeader from "@/components/chat-pages/direct-message-header";
import { CornerDownLeft, Mic, Image } from "lucide-react";
import { Profile } from "@/utils/supabase/models/profile";

interface DirectMessagePageProps {
  user: z.infer<typeof Profile>;
}

export default function DirectMessagePage({ user }: DirectMessagePageProps) {
  // hook into utilities like a07
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const queryUtils = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [draftMessageText, setDraftMessageText] = useState("");

  const chatId = router.query.chatId as string;
  const { data: chat } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (typeof chatId !== "string") throw new Error("Invalid chat ID");
      return await getChatById(supabase, chatId);
    },
    enabled: !!chatId,
  });


  const { data: users } = useQuery({
    queryKey: ["chatUsers", chatId],
    queryFn: async () => {
      if (typeof chatId !== "string") throw new Error("Invalid chat ID");
      return await getUsersInChat(supabase, chatId);
    },
    enabled: !!chatId,
  });

  const otherUser = users?.find(u => u.id !== user.id);

  const { data: messages } = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: async ({ pageParam = 0 }) => {
      return await getMessages(supabase, chatId as string, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => pages.length * lastPage.length,
    enabled: !!chat?.id,
  });

  const addMessageToCache = useCallback(
    (newMessage: z.infer<typeof DraftMessage>) =>
      addMessageToCacheFn(queryUtils, chatId as string, [user, otherUser!])(newMessage),
    [chatId, otherUser, queryUtils, user]
  );

  const updateMessageInCache = useCallback(
    (updatedMessage: z.infer<typeof DraftMessage>) =>
      updateMessageInCacheFn(queryUtils, chatId as string, [user, otherUser!])(updatedMessage),
    [chatId, otherUser, queryUtils, user]
  );

  const deleteMessageFromCache = useCallback(
    (messageId: string) =>
      deleteMessageFromCacheFn(queryUtils, chatId as string)(messageId),
    [chatId, queryUtils]
  );

  const handleSendMessage = () => {
    if (draftMessageText.trim() !== "" || selectedFile) {
      const draftMessage = {
        id: uuidv4(),
        content: draftMessageText,
        author_id: user.id,
        chat_id: chatId,
        attachment_url: null,
        created_at: new Date(),
      };

      addMessageToCache(draftMessage);

      const pendingMessage = draftMessageText;
      const pendingFile = selectedFile;

      setDraftMessageText("");
      setSelectedFile(null);

      sendMessage(supabase, draftMessage, selectedFile)
        .then((postedMessage) =>{
          updateMessageInCache(postedMessage)
    })
        .catch(() => {
          toast("Message failed to send. Please try again.");
          deleteMessageFromCache(draftMessage.id);
          setDraftMessageText(pendingMessage);
          setSelectedFile(pendingFile);
        });
    }
  };

useEffect(() => {
  if (!chat?.id) return;

  const messageChanges = supabase
    .channel('message-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'message', filter: `chat_id=eq.${chat.id}` },
      (payload) => {
        const newMessage = DraftMessage.parse(payload.new);
        if (newMessage.author_id !== user.id) {
          addMessageToCache(newMessage);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'message', filter: `chat_id=eq.${chat.id}` },
      (payload) => {
        const updatedMessage = DraftMessage.parse(payload.new);
        updateMessageInCache(updatedMessage);
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'message', filter: `chat_id=eq.${chat.id}` },
      (payload) => {
        const messageToDeleteID = payload.old.id;
        deleteMessageFromCache(messageToDeleteID);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(messageChanges);
    // If you implemented reaction changes
    // supabase.removeChannel(reactionChanges);
  };
}, [addMessageToCache, updateMessageInCache, deleteMessageFromCache, chat?.id, supabase, user.id, messages?.pages]);

  if (!chat || !otherUser) return <div>Loading chat...</div>;

  return (
    <div className="bg-[#DCDEE5] min-h-screen w-full flex items-center justify-center flex-col">
      <DirectMessageHeader name={otherUser.name || "Loading..."} online={true} />
      <Card className="bg-[#EFEAF6] h-[75vh] w-5/6 rounded-t-none mb-6 flex flex-col justify-between">
        <div className="flex-grow overflow-y-auto">
          <ChatMessageList>
            {messages?.pages.flatMap((page) =>
              page.map((message) => (
                <Message
                  key={message.id}
                  type={message.author.id === user.id ? MessageType.Sent : MessageType.Received}
                >
                  {message.content}
                  {message.attachment_url && (
                    <img src={message.attachment_url} className="mt-2 max-w-[200px] rounded-md" />
                  )}
                </Message>
              ))
            )}
            <div ref={messageEndRef} />
          </ChatMessageList>
        </div>
        <div className="justify-center flex">
          <form
            className="relative rounded-lg border bg-white focus-within:ring-1 focus-within:ring-ring p-0 w-11/12"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <ChatInput
              value={draftMessageText}
              onChange={(e) => setDraftMessageText(e.target.value)}
              placeholder="Type your message here..."
              onKeyDown={(e) => {
                if(e.key === "Enter" && !e.shiftKey){
                  e.preventDefault();
                  handleSendMessage()
                }
              }}
              className="min-h-12 resize-none rounded-lg bg-white border-0 p-3 shadow-none focus-visible:ring-0 w-full"
            />
            <div className="flex items-center p-3 pt-0">
              <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                <Image className="size-4"/>
                <span className="sr-only">Attach file</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Mic className="size-4" />
                <span className="sr-only">Use Microphone</span>
              </Button>
              <Button type="submit" size="sm" className="ml-auto gap-1.5 text-black bg-primary1">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
            {selectedFile && (
              <div className="px-3 pb-2">
                <div className="flex items-center bg-muted p-2 rounded-md">
                  <span className="text-xs truncate">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 w-6 p-0"
                    onClick={() => setSelectedFile(null)}
                  >
                    &times;
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
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
