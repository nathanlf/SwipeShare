import { z } from "zod";
import { Profile } from "./profile";

export const Chat = z.object({
  id: z.string(),
  user_1: Profile,
  user_2: Profile,
  last_activity: z.date({ coerce: true }).default(() => new Date()), // Timestamp of most recent activity
});
