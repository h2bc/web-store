'use client'
import { useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

export default function ClientToastErrorHandler({
  errors,
  children,
}: {
  errors: (string | null)[]
  children: ReactNode
}) {
  useEffect(() => {
    errors.forEach((error) => {
      if (error) {
        toast.error(error)
      }
    })
  }, [errors])

  return children
}
