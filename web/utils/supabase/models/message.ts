import { z } from "zod";
import { Profile } from "./profile";

export const Message = z.object({
  id: z.string(),
  content: z.string(),
  created_at: z.date({ coerce: true }).nullable().default(null),
  attachment_url: z.string().nullable(),
  author: Profile,
});

export const DraftMessage = z.object({
  id: z.string(),
  content: z.string(),
  author_id: z.string(),
  chat_id: z.string(),
  created_at: z.date({ coerce: true }).nullable().default(null),
  attachment_url: z.string().nullable(),
});
