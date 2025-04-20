import { z } from "zod";
import { DraftMessage, Message } from "../models/message";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { Profile } from "../models/profile";

/**
 * Creates a fallback author when the real profile data isn't available yet
 * (used in optimistic message caching).
 */
const getFallbackAuthor = (author_id: string): z.infer<typeof Profile> => ({
  id: author_id,
  name: "Sending...",
  handle: "sending",
  avatar_url: null,
  availability: [],
  is_flexible: false,
});

/**
 * Safely find a user from members array or return fallback
 */
const findAuthorOrFallback = (
  author_id: string,
  members?: z.infer<typeof Profile>[]
): z.infer<typeof Profile> => {
  if (!members || members.length === 0) {
    return getFallbackAuthor(author_id);
  }

  const foundUser = members.find((member) => member.id === author_id);
  if (!foundUser) {
    return getFallbackAuthor(author_id);
  }

  // Validate that the found user has all required fields
  try {
    return Profile.parse(foundUser);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return getFallbackAuthor(author_id);
  }
};

/** Generates a function that adds a message to the cache. */
export const addMessageToCacheFn =
  (
    queryUtils: QueryClient,
    chatId: string | string[] | undefined,
    members: z.infer<typeof Profile>[] | undefined
  ) =>
  (newMessage: z.infer<typeof DraftMessage>) => {
    queryUtils.setQueryData(
      ["messages", chatId],
      (oldData: InfiniteData<z.infer<typeof Message>[]> | undefined) => {
        const author = findAuthorOrFallback(newMessage.author_id, members);

        const parsedMessage = Message.parse({
          author,
          ...newMessage,
        });

        // If oldData doesn't exist, create a new cache structure
        if (!oldData) {
          return {
            pageParams: [0],
            pages: [[parsedMessage]],
          };
        }

        // Otherwise, update existing cache
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page, index) =>
            index === 0 ? [...page, parsedMessage] : page
          ),
        };
      }
    );
  };

/** Generates a function that updates a message in the cache. */
export const updateMessageInCacheFn =
  (
    queryUtils: QueryClient,
    chatId: string | string[] | undefined,
    members: z.infer<typeof Profile>[] | undefined
  ) =>
  (updatedMessage: z.infer<typeof DraftMessage>) => {
    queryUtils.setQueryData(
      ["messages", chatId],
      (oldData: InfiniteData<z.infer<typeof Message>[]> | undefined) => {
        const author = findAuthorOrFallback(updatedMessage.author_id, members);

        const parsedMessage = Message.parse({
          author,
          ...updatedMessage,
        });

        if (!oldData) {
          return {
            pageParams: [0],
            pages: [[parsedMessage]],
          };
        }

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((message) =>
              message.id === updatedMessage.id ? parsedMessage : message
            )
          ),
        };
      }
    );
  };

/** Generates a function that deletes a message from the cache. */
export const deleteMessageFromCacheFn =
  (queryUtils: QueryClient, chatId: string | string[] | undefined) =>
  (messageId: string) => {
    queryUtils.setQueryData(
      ["messages", chatId],
      (oldData: InfiniteData<z.infer<typeof Message>[]> | undefined) => {
        if (!oldData) {
          return { pageParams: [0], pages: [] };
        }

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.filter((message) => message.id !== messageId)
          ),
        };
      }
    );
  };
