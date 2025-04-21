import { z } from "zod";

export const Profile = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  avatar_url: z.string().nullable(),
  availability: z.array(z.any()).nullable().optional(), // Array of JSONB objects
  is_flexible: z.boolean().nullable().optional(),
});
