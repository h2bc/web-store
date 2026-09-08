import { Button } from '@/components/ui/button'

export default function RightsNotice() {
  const year = new Date().getFullYear()
  return (
    <Button variant="ghost" disabled>
      © {year} h2bc
    </Button>
  )
}
