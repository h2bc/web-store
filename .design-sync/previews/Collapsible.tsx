import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'h2bc-web-front'
import { FiMenu } from 'react-icons/fi'
import { ChevronDown, X } from 'lucide-react'

const navLinks = ['Shop', 'Gallery', 'About', 'Contact']

export const OpenMenu = () => (
  <Collapsible open className="w-64 border-b">
    <div className="flex items-center justify-between px-4 py-2">
      <span className="font-blackletter text-2xl">h2bc</span>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle menu">
          <X />
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className="bg-background border-t px-4">
      <ul className="flex flex-col items-stretch py-2 divide-y divide-black/10">
        {navLinks.map((label) => (
          <li key={label}>
            <a href="#" className="block w-full text-center px-6 py-4 text-2xl">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </CollapsibleContent>
  </Collapsible>
)

export const ClosedMenu = () => (
  <Collapsible className="w-64 border-b">
    <div className="flex items-center justify-between px-4 py-2">
      <span className="font-blackletter text-2xl">h2bc</span>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle menu">
          <FiMenu />
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className="bg-background border-t px-4">
      <ul className="flex flex-col items-stretch py-2 divide-y divide-black/10">
        {navLinks.map((label) => (
          <li key={label}>
            <a href="#" className="block w-full text-center px-6 py-4 text-2xl">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </CollapsibleContent>
  </Collapsible>
)

export const ProductDetailsSection = () => (
  <Collapsible open className="w-full max-w-xs border rounded-md p-4 text-sm">
    <CollapsibleTrigger asChild>
      <button className="flex w-full items-center justify-between font-medium">
        Care instructions
        <ChevronDown className="h-4 w-4" />
      </button>
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-3 text-muted-foreground">
      Wash at 30°C with similar colours. Do not tumble dry. Iron inside out on
      low heat and never over the print.
    </CollapsibleContent>
  </Collapsible>
)
