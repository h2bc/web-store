'use server'

import { FetchError } from '@medusajs/js-sdk'
import { sdk } from '@/lib/medusa'
import { contactTopics, type ContactFormData } from '@/lib/schemas/contact'

type ContactResult = { error: string | null }

export async function submitContactMessage({
  name,
  email,
  topic,
  message,
  website,
}: ContactFormData): Promise<ContactResult> {
  try {
    await sdk.client.fetch('/store/contact', {
      method: 'POST',
      body: { name, email, topic: contactTopics[topic], message, website },
    })

    return { error: null }
  } catch (error) {
    const reason =
      error instanceof FetchError && error.status === 400
        ? error.message
        : 'Failed to send your message. Please try again later.'

    return { error: reason }
  }
}
