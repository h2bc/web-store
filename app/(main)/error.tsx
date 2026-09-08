'use client'

import ErrorAlert from '@/components/feedback/error-alert'

export default function MainError({ error }: { error: Error }) {
  return (
    <div className="flex justify-center pt-15">
      <ErrorAlert
        title="Something went wrong"
        message={error.message || 'Please try again.'}
      />
    </div>
  )
}
