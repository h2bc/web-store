'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  contactFormSchema,
  contactTopics,
  type ContactFormData,
} from '@/lib/schemas/contact'
import { submitContactMessage } from '@/lib/data/contact'
import { INSTAGRAM_URL } from '@/lib/social'

export default function ContactForm({
  initialSent = false,
}: {
  initialSent?: boolean
}) {
  const [isSent, setIsSent] = useState(initialSent)
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      email: '',
      topic: 'order',
      message: '',
      website: '',
    },
  })
  const { isSubmitting } = form.formState

  const onSubmit = async (data: ContactFormData) => {
    const { error } = await submitContactMessage(data)

    if (error) {
      toast.error(error)

      return
    }

    form.reset()
    setIsSent(true)
  }

  if (isSent) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Message sent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Thanks for reaching out.</p>
            <p>We will reply to your email as soon as we can.</p>
          </CardContent>
          <CardFooter>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setIsSent(false)}
            >
              Send another message
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <p className="mb-8 text-muted-foreground">
        Send us a message below, or DM us on{' '}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Instagram
        </a>
        .
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel className="text-sm font-medium tracking-wide">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      autoComplete="name"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel className="text-sm font-medium tracking-wide">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel className="text-sm font-medium tracking-wide">
                  Topic
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(contactTopics).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel className="text-sm font-medium tracking-wide">
                  Message
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what's up..."
                    className="min-h-32 resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...form.register('website')}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
