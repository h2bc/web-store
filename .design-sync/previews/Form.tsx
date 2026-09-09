import * as React from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from 'h2bc-web-front'

type AddressValues = {
  email: string
  first_name: string
  last_name: string
  address_1: string
  postal_code: string
}

const defaultValues: AddressValues = {
  email: '',
  first_name: '',
  last_name: '',
  address_1: '',
  postal_code: '',
}

export const AddressForm = () => {
  const form = useForm<AddressValues>({ defaultValues })
  return (
    <Form {...form}>
      <form className="max-w-md space-y-6" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Gedimino pr. 9" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" size="lg" className="w-full">
          Continue to delivery
        </Button>
      </form>
    </Form>
  )
}

export const WithDescription = () => {
  const form = useForm<AddressValues>({ defaultValues })
  return (
    <Form {...form}>
      <form className="max-w-md space-y-6" noValidate>
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal code</FormLabel>
              <FormControl>
                <Input placeholder="LT-01103" {...field} />
              </FormControl>
              <FormDescription>
                Lithuanian codes start with LT- followed by five digits.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export const WithErrors = () => {
  const form = useForm<AddressValues>({
    defaultValues: { ...defaultValues, email: 'jonas@' },
  })
  React.useEffect(() => {
    form.setError('email', { type: 'manual', message: 'Enter a valid email address' })
    form.setError('first_name', { type: 'manual', message: 'First name is required' })
  }, [form])
  return (
    <Form {...form}>
      <form className="max-w-md space-y-6" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
