'use server'

import xss from 'xss'
import {
  contactFormSchema,
  type ContactFormResponse,
} from '@/lib/schemas/contact'

export async function submitContactMessage(
  data: unknown
): Promise<ContactFormResponse> {
  try {
    // 1. Validate structure with Zod
    const validated = contactFormSchema.safeParse(data)

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors
      return {
        success: false,
        message: 'Please fix the errors and try again.',
        errors: {
          email: errors.email?.[0],
          topic: errors.topic?.[0],
          message: errors.message?.[0],
        },
      }
    }

    // 2. Sanitize content to prevent XSS
    const sanitized = {
      email: xss(validated.data.email.trim().toLowerCase()),
      topic: validated.data.topic, // Enum value, already safe
      message: xss(validated.data.message.trim()),
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, just log it
    console.log('Sanitized contact form submission:', sanitized)

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    }
  }
}
