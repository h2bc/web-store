'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { FiMenu } from 'react-icons/fi'
import { X } from 'lucide-react'
import NavLinks from './nav-links'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)

  if (usePathname().startsWith('/checkout')) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle menu">
          {isOpen ? <X /> : <FiMenu />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute left-0 right-0 top-full bg-background shadow-lg border-b z-40 px-4 sm:px-8 md:px-12 lg:px-18 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out">
        <NavLinks
          ulClassName="flex flex-col items-stretch py-2 divide-y divide-black/10"
          linkClassName="block w-full text-center px-6 py-4 text-2xl"
          onNavigate={() => setIsOpen(false)}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
