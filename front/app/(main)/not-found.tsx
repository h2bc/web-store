import Image from 'next/image'
import EmptyState from '@/components/feedback/empty-state'

const NotFound = () => (
  <div className="flex-1 flex flex-col self-stretch items-center justify-center">
    <EmptyState description="The page you are looking for does not exist.">
      <Image
        src="/404.gif"
        alt=""
        width={320}
        height={256}
        priority
        unoptimized
      />
    </EmptyState>
  </div>
)

export default NotFound
