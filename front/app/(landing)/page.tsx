import NavLinks from '@/components/layout/header/nav-links'
import Logo3DViewer from '@/components/landing/logo-3d-viewer'

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <Logo3DViewer />

        <NavLinks ulClassName="flex flex-col items-center justify-center space-y-5 text-4xl md:mt-0 sm:flex-row sm:space-y-0 sm:gap-8 md:flex-col md:space-y-5 md:gap-0" />
      </div>
    </div>
  )
}
