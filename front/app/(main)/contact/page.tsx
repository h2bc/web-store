import type { Metadata } from 'next'
import Heading from '@/components/layout/heading'
import ContactForm from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Get in touch with h2bc about orders, sizing or collaborations.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-4xl flex flex-col flex-1">
        <Heading level={1} font="blackletter" className="mb-8">
          Contact us
        </Heading>
        <ContactForm initialSent={sent === '1'} />
      </div>
    </div>
  )
}
