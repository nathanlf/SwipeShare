import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { getChatById, getUsersInChat } from "@/utils/supabase/queries/chat";
import { getMessages, sendMessage } from "@/utils/supabase/queries/message";
import {
  addMessageToCacheFn,
  updateMessageInCacheFn,
  deleteMessageFromCacheFn,
} from "@/utils/supabase/cache/message-cache";
import { z } from "zod";
import { DraftMessage } from "@/utils/supabase/models/message";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import Message, { MessageType } from "@/components/ui/chat/message";
import DirectMessageHeader from "@/components/chat-pages/direct-message-header";
import { CornerDownLeft, Image as ImageIcon } from "lucide-react";
import { getProfile } from "@/utils/supabase/queries/profile";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

interface DirectMessagePageProps {
  authUser: User;
}

export default function DirectMessagePage({
  authUser,
}: DirectMessagePageProps) {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const queryUtils = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track the ID of the anchor message (the one we want to stay in view)
  const firstVisibleMessageIdRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [draftMessageText, setDraftMessageText] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isAnchoringScroll, setIsAnchoringScroll] = useState(false);

  const chatId = router.query.chatId as string;
  const { data: chat } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (typeof chatId !== "string") throw new Error("Invalid chat ID");
      return await getChatById(supabase, chatId);
    },
    enabled: !!chatId,
  });

  const { data: user } = useQuery({
    queryKey: ["user", authUser.id],
    queryFn: async () => {
      return await getProfile(supabase, authUser.id);
    },
    enabled: !!authUser,
  });

  const { data: users } = useQuery({
    queryKey: ["chatUsers", chatId],
    queryFn: async () => {
      if (typeof chatId !== "string") throw new Error("Invalid chat ID");
      return await getUsersInChat(supabase, chatId);
    },
    enabled: !!chatId,
  });

  const otherUser = users?.find((u) => u.id !== user?.id);

  // Function to find the first visible message element
  const findFirstVisibleMessage = useCallback(() => {
    if (!scrollContainerRef.current) return null;

    const container = scrollContainerRef.current;
    const containerTop = container.getBoundingClientRect().top;
    const messageElements = container.querySelectorAll("[data-message-id]");

    for (const element of messageElements) {
      const rect = element.getBoundingClientRect();
      // If element is at least partially visible
      if (rect.bottom > containerTop) {
        // Get the message ID
        const messageId = element.getAttribute("data-message-id");
        return messageId;
      }
    }
    return null;
  }, []);

  // Function to find a message element by ID and scroll to it
  const scrollToMessageById = useCallback((messageId: string | null) => {
    if (!messageId || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const messageElement = container.querySelector(
      `[data-message-id="${messageId}"]`
    );

    if (messageElement) {
      // Use a small offset to position it visibly but not right at the top
      messageElement.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }, []);

  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: async ({ pageParam = 0 }) => {
      // Store first visible message before fetching more
      if (!isAnchoringScroll && !isFetchingNextPage) {
        setIsAnchoringScroll(true);
        firstVisibleMessageIdRef.current = findFirstVisibleMessage();
      }

      return await getMessages(supabase, chatId as string, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0 || lastPage.length < 50) return undefined;
      return pages.length * 50;
    },
    enabled: !!chat?.id,
  });

  // After loading messages, restore scroll position
  useEffect(() => {
    if (!isFetchingNextPage && isAnchoringScroll) {
      // We need to wait until the DOM has updated with the new messages
      // that's why we use requestAnimationFrame
      requestAnimationFrame(() => {
        scrollToMessageById(firstVisibleMessageIdRef.current);
        // Reset anchoring state
        setIsAnchoringScroll(false);
      });
    }
  }, [isFetchingNextPage, isAnchoringScroll, scrollToMessageById]);

  const addMessageToCache = useCallback(
    (newMessage: z.infer<typeof DraftMessage>) =>
      addMessageToCacheFn(queryUtils, chatId as string, [user!, otherUser!])(
        newMessage
      ),
    [chatId, otherUser, queryUtils, user]
  );

  const updateMessageInCache = useCallback(
    (updatedMessage: z.infer<typeof DraftMessage>) =>
      updateMessageInCacheFn(queryUtils, chatId as string, [user!, otherUser!])(
        updatedMessage
      ),
    [chatId, otherUser, queryUtils, user]
  );

  const deleteMessageFromCache = useCallback(
    (messageId: string) =>
      deleteMessageFromCacheFn(queryUtils, chatId as string)(messageId),
    [chatId, queryUtils]
  );

  const handleLoadMoreMessages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isAnchoringScroll) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isAnchoringScroll]);

  const handleSendMessage = () => {
    if (draftMessageText.trim() !== "" || selectedFile) {
      const draftMessage = {
        id: uuidv4(),
        content: draftMessageText,
        author_id: user!.id,
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
        .then((postedMessage) => {
          updateMessageInCache(postedMessage);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!chat?.id) return;

    const messageChanges = supabase
      .channel("message-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          const newMessage = DraftMessage.parse(payload.new);
          if (newMessage.author_id !== user?.id) {
            addMessageToCache(newMessage);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "message",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          const updatedMessage = DraftMessage.parse(payload.new);
          updateMessageInCache(updatedMessage);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "message",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          const messageToDeleteID = payload.old.id;
          deleteMessageFromCache(messageToDeleteID);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChanges);
    };
  }, [
    addMessageToCache,
    updateMessageInCache,
    deleteMessageFromCache,
    chat?.id,
    supabase,
    user?.id,
    messages?.pages,
  ]);

  const isParticipant = users?.some((u) => u.id === authUser.id);
  if (!isParticipant)
    return <div className="text-center">You are not authorized to view this chat.</div>;
  if (!chat || !otherUser || !user) return <div>Loading chat...</div>;

  const allMessages = messages?.pages.flatMap((page) => page).reverse() || [];

  return (
    <div className="bg-[#DCDEE5] min-h-screen w-full flex items-center justify-center flex-col">
      <DirectMessageHeader
        name={otherUser.name || "Loading..."}
        online={true}
      />
      <Card className="bg-[#EFEAF6] h-[75vh] w-5/6 rounded-t-none mb-6 flex flex-col justify-between">
        <div
          className="flex-grow overflow-y-auto"
          ref={scrollContainerRef}
          style={{
            // This CSS property helps with scroll anchoring
            overscrollBehavior: "contain",
            // This ensures content is positioned absolutely during scroll
            position: "relative",
          }}
        >
          <ChatMessageList>
            {hasNextPage && (
              <div
                className="h-8 flex items-center justify-center cursor-pointer text-sm text-blue-500 hover:text-blue-700 mb-4"
                onClick={handleLoadMoreMessages}
              >
                {isFetchingNextPage
                  ? "Loading previous messages..."
                  : "Load previous messages"}
              </div>
            )}

            {allMessages.map((message) => {
              const isSent = message.author.id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`mb-4 flex flex-col ${
                    isSent ? "items-end" : "items-start"
                  }`}
                  data-message-id={message.id}
                >
                  <Message
                    type={isSent ? MessageType.Sent : MessageType.Received}
                  >
                    {message.content}
                  </Message>
                  {message.attachment_url && (
                    <button
                      onClick={() => setFullscreenImage(message.attachment_url)}
                      className={`mt-4 ${isSent ? "mr-10" : "ml-10"}`}
                    >
                      <Image
                        src={message.attachment_url}
                        className="max-w-[200px] rounded-md"
                        width={300}
                        height={300}
                        alt="attachment"
                      />
                    </button>
                  )}
                </div>
              );
            })}
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-12 resize-none rounded-lg bg-white border-0 p-3 shadow-none focus-visible:ring-0 w-full"
            />
            <div className="flex items-center p-3 pt-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="size-4" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Button
                type="submit"
                size="sm"
                className="ml-auto gap-1.5 text-black bg-primary1"
              >
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

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
          onClick={() => setFullscreenImage(null)}
        >
          <Image
            src={fullscreenImage}
            alt="Fullscreen attachment"
            width={1000}
            height={1000}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl"
          />
        </div>
      )}
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
      authUser: userData.user,
    },
  };
}
