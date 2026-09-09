import { Button, IconBadge } from 'h2bc-web-front'
import { ShoppingBag, Bell } from 'lucide-react'

export const CartButton = () => (
  <div className="flex items-center gap-6">
    <Button variant="ghost" aria-label="Cart">
      <IconBadge badge="2" badgeClassName="bg-pink-500">
        <ShoppingBag />
      </IconBadge>
    </Button>
    <Button variant="ghost" aria-label="Cart">
      <IconBadge badge="12" badgeClassName="bg-pink-500">
        <ShoppingBag />
      </IconBadge>
    </Button>
    <Button variant="ghost" aria-label="Cart">
      <ShoppingBag />
    </Button>
  </div>
)

export const Positions = () => (
  <div className="flex items-center gap-10 p-4">
    <IconBadge badge="3" position="top-right">
      <Bell />
    </IconBadge>
    <IconBadge badge="3" position="top-left">
      <Bell />
    </IconBadge>
    <IconBadge badge="3" position="bottom-right">
      <Bell />
    </IconBadge>
    <IconBadge badge="3" position="bottom-left">
      <Bell />
    </IconBadge>
  </div>
)

export const WithoutBadge = () => (
  <div className="flex items-center gap-6">
    <IconBadge>
      <ShoppingBag />
    </IconBadge>
    <IconBadge badge="">
      <Bell />
    </IconBadge>
  </div>
)
