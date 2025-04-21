import { z } from "zod";
import { Profile } from "./profile";

export const Reaction = z.object({
  id: z.string(),
  message_id: z.string(),
  reaction: z.string(),
  profile_id: z.string(),
});

export const MessageReaction = z.object({
  id: z.string(),
  reaction: z.string(),
  profile_id: z.string(),
});

export const MessageReactionWithoutId = MessageReaction.omit({ id: true });

export const Message = z.object({
  id: z.string(),
  content: z.string(),
  created_at: z.date({ coerce: true }).nullable().default(null),
  attachment_url: z.string().nullable(),
  author: Profile,
  reactions: MessageReaction.array().default([]),
});

export const DraftMessage = z.object({
  id: z.string(),
  content: z.string(),
  author_id: z.string(),
  chat_id: z.string(),
  created_at: z.date({ coerce: true }).nullable().default(null),
  attachment_url: z.string().nullable(),
});
