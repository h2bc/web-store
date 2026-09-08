import Heading from '@/components/layout/heading'
import ContactForm from '@/components/contact/contact-form'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with h2bc',
}

export default function ContactPage() {
  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-4xl flex flex-col flex-1">
        <div className="pb-10">
          <Heading
            level={1}
            font="blackletter"
            className="text-4xl lg:text-5xl"
          >
            Contact
          </Heading>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or need assistance? Send us a message and we&apos;ll
            get back to you as soon as possible.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  )
}
