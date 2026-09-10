'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AddressElement } from '@stripe/react-stripe-js'
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { toast } from 'sonner'
import type { HttpTypes } from '@medusajs/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setCheckoutContact } from '@/lib/data/cart'
import { DEFAULT_COUNTRY_CODE } from '@/lib/store'

interface AddressStepProps {
  cart: HttpTypes.StoreCart
  countryCodes: string[]
}

export default function AddressStep({ cart, countryCodes }: AddressStepProps) {
  const router = useRouter()
  const [email, setEmail] = useState(cart.email ?? '')
  const [address, setAddress] = useState<
    StripeAddressElementChangeEvent['value'] | null
  >(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const saved = cart.shipping_address

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!address) return

    setIsSubmitting(true)

    const { error } = await setCheckoutContact({ email, address })

    if (error) {
      toast.error(error)
      setIsSubmitting(false)
      return
    }

    router.push('/checkout?step=delivery')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="checkout-email">Email</Label>
        <Input
          id="checkout-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <AddressElement
        options={{
          mode: 'shipping',
          allowedCountries: countryCodes,
          display: { name: 'split' },
          fields: { phone: 'always' },
          validation: { phone: { required: 'never' } },
          autocomplete: { mode: 'disabled' },
          defaultValues: {
            firstName: saved?.first_name ?? null,
            lastName: saved?.last_name ?? null,
            phone: saved?.phone ?? null,
            address: {
              line1: saved?.address_1 ?? null,
              line2: saved?.address_2 ?? null,
              city: saved?.city ?? null,
              state: saved?.province ?? null,
              postal_code: saved?.postal_code ?? null,
              country: (
                saved?.country_code ?? DEFAULT_COUNTRY_CODE
              ).toUpperCase(),
            },
          },
        }}
        onChange={(event) => setAddress(event.complete ? event.value : null)}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || !address}
      >
        {isSubmitting ? 'Saving…' : 'Continue to delivery'}
      </Button>
    </form>
  )
}
