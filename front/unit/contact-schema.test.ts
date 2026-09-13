import { describe, expect, it } from 'vitest'
import { contactFormSchema, contactTopics } from '@/lib/schemas/contact'

const validMessage = {
  name: 'Jonas',
  email: 'jonas@example.com',
  topic: 'returns',
  message: 'I would like to return my order.',
}

describe('contact form schema', () => {
  it('accepts a complete message', () => {
    const result = contactFormSchema.safeParse(validMessage)

    expect(result.success).toBe(true)
  })

  it('accepts every topic in the list and nothing else', () => {
    const topics = Object.keys(contactTopics)

    const accepted = topics.map(
      (topic) => contactFormSchema.safeParse({ ...validMessage, topic }).success
    )
    const rejected = contactFormSchema.safeParse({
      ...validMessage,
      topic: 'spam',
    })

    expect(accepted).toEqual(topics.map(() => true))
    expect(rejected.success).toBe(false)
  })

  it('rejects a name that is blank or longer than 100 characters', () => {
    const blank = contactFormSchema.safeParse({ ...validMessage, name: ' ' })
    const long = contactFormSchema.safeParse({
      ...validMessage,
      name: 'a'.repeat(101),
    })

    expect(blank.success).toBe(false)
    expect(long.success).toBe(false)
  })

  it('rejects an invalid email or one longer than 254 characters', () => {
    const invalid = contactFormSchema.safeParse({
      ...validMessage,
      email: 'not-an-email',
    })
    const long = contactFormSchema.safeParse({
      ...validMessage,
      email: `${'a'.repeat(250)}@example.com`,
    })

    expect(invalid.success).toBe(false)
    expect(long.success).toBe(false)
  })

  it('rejects a message shorter than 5 or longer than 5000 characters', () => {
    const short = contactFormSchema.safeParse({
      ...validMessage,
      message: 'Hi',
    })
    const long = contactFormSchema.safeParse({
      ...validMessage,
      message: 'a'.repeat(5001),
    })

    expect(short.success).toBe(false)
    expect(long.success).toBe(false)
  })

  it('leaves the honeypot optional', () => {
    const result = contactFormSchema.safeParse({
      ...validMessage,
      website: undefined,
    })

    expect(result.success).toBe(true)
  })
})
