import { z } from "zod";

export const Post = z.object({
  id: z.string().uuid(),
  content: z.string(),
  author_id: z.string().uuid(),
  created_at: z.string().nullable().optional(),
  attachment_url: z.string().nullable().optional(),
  dining_halls:z.array(z.any()).nullable().optional(),
});

export type PostType = z.infer<typeof Post>;
