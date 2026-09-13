import { z } from 'zod'

export const contactTopics = {
  order: 'Order / Shipping',
  returns: 'Returns & Refunds',
  product: 'Product Question',
  collab: 'Collaboration',
  other: 'Other',
} as const

export type ContactTopic = keyof typeof contactTopics

const topicKeys = Object.keys(contactTopics) as [
  ContactTopic,
  ...ContactTopic[],
]

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(100, 'Name is too long.'),
  email: z
    .string()
    .email('Enter a valid email.')
    .max(254, 'Email is too long.'),
  topic: z.enum(topicKeys, {
    errorMap: () => ({ message: 'Select a topic.' }),
  }),
  message: z
    .string()
    .trim()
    .min(5, 'Message is too short.')
    .max(5000, 'Message is too long (max 5000 characters).'),
  website: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
