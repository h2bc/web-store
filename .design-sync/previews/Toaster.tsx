import * as React from 'react'
// toast must come from the bundle: a second sonner copy would never reach this Toaster.
import { Toaster, toast } from 'h2bc-web-front'

// sonner renders toasts position:fixed; a transformed, sized box becomes their
// containing block so the card (and the capture) has something to paint.
const Stage = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-48 w-full" style={{ transform: 'translateZ(0)' }}>
    {children}
  </div>
)

const Fire = ({ fire }: { fire: () => void }) => {
  React.useEffect(() => {
    fire()
  }, [fire])
  return null
}

export const Success = () => (
  <Stage>
    <Toaster position="top-center" richColors />
    <Fire fire={() => toast.success('Added to cart')} />
  </Stage>
)

export const ToastError = () => (
  <Stage>
    <Toaster position="top-center" richColors />
    <Fire fire={() => toast.error('Could not update your cart. Please try again.')} />
  </Stage>
)

export const WithDescription = () => (
  <Stage>
    <Toaster position="top-center" richColors />
    <Fire
      fire={() =>
        toast.success('Message sent', {
          description: 'We will get back to you within two business days.',
        })
      }
    />
  </Stage>
)
