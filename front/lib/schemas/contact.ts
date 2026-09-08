import { z } from 'zod'

export const contactTopics = {
  order: 'Order / Shipping',
  returns: 'Returns & Refunds',
  product: 'Product Question',
  collab: 'Collaboration',
  other: 'Other',
} as const

export type ContactTopic = keyof typeof contactTopics

export const contactFormSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email.')
    .max(254, 'Email is too long.'),
  topic: z.enum(['order', 'returns', 'product', 'collab', 'other'], {
    errorMap: () => ({ message: 'Select a topic.' }),
  }),
  message: z
    .string()
    .min(5, 'Message is too short.')
    .max(5000, 'Message is too long (max 5000 characters).'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export interface ContactFormResponse {
  success: boolean
  message?: string
  errors?: {
    email?: string
    topic?: string
    message?: string
  }
}
