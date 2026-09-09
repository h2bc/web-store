import { FiInstagram, FiYoutube } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { INSTAGRAM_URL, YOUTUBE_URL } from '@/lib/social'

const SOCIAL_LINKS = [
  { href: INSTAGRAM_URL, label: 'Instagram', Icon: FiInstagram },
  { href: YOUTUBE_URL, label: 'YouTube', Icon: FiYoutube },
]

export default function SocialIcons() {
  return (
    <div className="flex items-center gap-2">
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <Button key={label} variant="ghost" size={'icon'}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
          >
            <Icon />
          </a>
        </Button>
      ))}
    </div>
  )
}
