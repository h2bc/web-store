import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from 'h2bc-web-front'
import { ChevronDown } from 'lucide-react'

const regions = [
  { id: 'eu', name: 'Europe', current: false },
  { id: 'lt', name: 'Lithuania', current: true },
]

export const Open = () => (
  <div className="h-48">
    <DropdownMenu open modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1 md:px-6">
          LT
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48 p-2">
        {regions.map((region) => (
          <DropdownMenuItem
            key={region.id}
            className={
              region.current
                ? 'px-5 py-1.5 text-sm font-bold'
                : 'px-5 py-1.5 text-sm font-normal'
            }
          >
            <span className="inline-block w-3">{region.current ? '>' : ''}</span>
            <span>{region.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

export const WithGroups = () => (
  <div className="h-64">
    <DropdownMenu open modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1">
          Sort &amp; filter
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value="newest">
          <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-asc">
            Price: low to high
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Show</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>In stock only</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Sale items</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          Reset filters
          <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

export const TriggerClosed = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="gap-1 md:px-6">
        EU
        <ChevronDown size={16} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="min-w-48 p-2">
      <DropdownMenuItem>Europe</DropdownMenuItem>
      <DropdownMenuItem>Lithuania</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
