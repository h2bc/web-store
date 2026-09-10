'use client'

import { useMemo, type ReactNode } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import type { Appearance } from '@stripe/stripe-js'
import { getStripe } from '@/lib/stripe'

const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#171717',
    colorText: '#0a0a0a',
    colorTextSecondary: '#737373',
    colorTextPlaceholder: '#737373',
    colorDanger: '#e7000b',
    colorBackground: '#ffffff',
    borderRadius: '6px',
    fontFamily: 'Arial, sans-serif',
    fontSizeBase: '14px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e5e5e5',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '8px 12px',
    },
    '.Input:focus': {
      border: '1px solid #e5e5e5',
      boxShadow: '0 0 0 1px #a1a1a1',
      outline: 'none',
    },
    '.Input--invalid': {
      border: '1px solid #e7000b',
      boxShadow: 'none',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    '.Error': {
      fontSize: '13px',
    },
  },
}

interface CheckoutElementsProps {
  publishableKey: string
  clientSecret?: string | null
  children: ReactNode
}

export default function CheckoutElements({
  publishableKey,
  clientSecret,
  children,
}: CheckoutElementsProps) {
  const stripePromise = useMemo(
    () => getStripe(publishableKey),
    [publishableKey]
  )

  const options = useMemo(
    () =>
      clientSecret
        ? { clientSecret, appearance, loader: 'auto' as const }
        : { appearance, loader: 'auto' as const },
    [clientSecret]
  )

  return (
    <Elements
      key={clientSecret ?? 'no-secret'}
      stripe={stripePromise}
      options={options}
    >
      {children}
    </Elements>
  )
}
