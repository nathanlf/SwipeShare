import { z } from "zod";

export const Profile = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  avatar_url: z.string().nullable(),
  availability: z.array(z.any()).nullable().optional(),
  is_flexible: z.boolean().nullable(),
  is_donator: z.boolean().nullable(),
});
