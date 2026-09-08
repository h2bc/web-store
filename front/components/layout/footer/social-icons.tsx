import { FiInstagram, FiYoutube } from 'react-icons/fi'
import { Button } from '@/components/ui/button'

export const INSTAGRAM_HANDLE = '_h2bc'
export const YOUTUBE_HANDLE = '_h2bc'

const SOCIAL_LINKS = [
  {
    href: `https://instagram.com/${INSTAGRAM_HANDLE}`,
    label: 'Instagram',
    Icon: FiInstagram,
  },
  {
    href: `https://youtube.com/@${YOUTUBE_HANDLE}`,
    label: 'YouTube',
    Icon: FiYoutube,
  },
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
