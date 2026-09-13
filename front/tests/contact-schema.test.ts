import { describe, expect, it } from 'vitest'
import { contactFormSchema, contactTopics } from '@/lib/schemas/contact'
import { CONTACT_MESSAGE } from './support/data'

describe('contact form schema', () => {
  it('accepts a complete message', () => {
    const result = contactFormSchema.safeParse(CONTACT_MESSAGE)

    expect(result.success).toBe(true)
  })

  it('accepts every topic in the list and nothing else', () => {
    const topics = Object.keys(contactTopics)

    const accepted = topics.map(
      (topic) =>
        contactFormSchema.safeParse({ ...CONTACT_MESSAGE, topic }).success
    )
    const rejected = contactFormSchema.safeParse({
      ...CONTACT_MESSAGE,
      topic: 'spam',
    })

    expect(accepted).toEqual(topics.map(() => true))
    expect(rejected.success).toBe(false)
  })

  it('rejects a name that is blank or longer than 100 characters', () => {
    const blank = contactFormSchema.safeParse({ ...CONTACT_MESSAGE, name: ' ' })
    const long = contactFormSchema.safeParse({
      ...CONTACT_MESSAGE,
      name: 'a'.repeat(101),
    })

    expect(blank.success).toBe(false)
    expect(long.success).toBe(false)
  })

  it('rejects an invalid email or one longer than 254 characters', () => {
    const invalid = contactFormSchema.safeParse({
      ...CONTACT_MESSAGE,
      email: 'not-an-email',
    })
    const long = contactFormSchema.safeParse({
      ...CONTACT_MESSAGE,
      email: `${'a'.repeat(250)}@example.com`,
    })

    expect(invalid.success).toBe(false)
    expect(long.success).toBe(false)
  })

  it('rejects a message shorter than 5 or longer than 5000 characters', () => {
    const short = contactFormSchema.safeParse({
      ...CONTACT_MESSAGE,
      message: 'Hi',
    })
    const long = contactFormSchema.safeParse({
      ...CONTACT_MESSAGE,
      message: 'a'.repeat(5001),
    })

    expect(short.success).toBe(false)
    expect(long.success).toBe(false)
  })

  it('leaves the honeypot optional', () => {
    const result = contactFormSchema.safeParse({
      ...CONTACT_MESSAGE,
      website: undefined,
    })

    expect(result.success).toBe(true)
  })
})
