import { z } from "zod";

/** Defines the schema for profile and author data. */
export const Profile = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  avatar_url: z.string().nullable(),
});
