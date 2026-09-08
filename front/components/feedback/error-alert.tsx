import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ErrorAlertProps {
  message: string
  title?: string
  className?: string
}

export default function ErrorAlert({
  message,
  title = 'Error',
  className,
}: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn('max-w-2xl', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
