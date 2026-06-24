import { z } from 'zod';

export const loginBodySchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(50),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
