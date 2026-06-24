import { z } from 'zod';

export const addToCartBodySchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z
    .number({ error: 'quantity must be a number' })
    .int('quantity must be an integer')
    .positive('quantity must be at least 1')
    .max(99, 'quantity cannot exceed 99'),
});

export type AddToCartBody = z.infer<typeof addToCartBodySchema>;

export const removeFromCartParamsSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});

export type RemoveFromCartParams = z.infer<typeof removeFromCartParamsSchema>;
