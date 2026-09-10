'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ErrorAlert from '@/components/feedback/error-alert'
import { initiateStripeSession } from '@/lib/data/payment'

export default function PaymentSessionStarter() {
  const router = useRouter()
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (started.current) return
    started.current = true

    initiateStripeSession().then(({ error }) => {
      if (error) {
        setError(error)
      } else {
        router.refresh()
      }
    })
  }, [router])

  if (error) {
    return <ErrorAlert message={error} />
  }

  return <p className="text-sm text-muted-foreground">Preparing payment…</p>
}
