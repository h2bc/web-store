'use server'

import { FetchError } from '@medusajs/js-sdk'
import { headers } from 'next/headers'
import { sdk } from '@/lib/medusa'
import { contactTopics, type ContactFormData } from '@/lib/schemas/contact'

type ContactResult = { error: string | null }

async function getClientIp() {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]

  return forwarded?.trim() || requestHeaders.get('x-real-ip') || undefined
}

export async function submitContactMessage({
  name,
  email,
  topic,
  message,
  website,
}: ContactFormData): Promise<ContactResult> {
  try {
    const clientIp = await getClientIp()

    await sdk.client.fetch('/store/contact', {
      method: 'POST',
      headers: clientIp ? { 'x-forwarded-for': clientIp } : {},
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
