import NavLinks from '@/components/layout/header/nav-links'
import Logo3DViewer from '@/components/landing/logo-3d-viewer'
import JsonLd from '@/components/seo/json-ld'
import { HOME_HEADING, organizationJsonLd } from '@/lib/seo'

// Metadata and JSON-LD depend on runtime env, so never prerender at build.
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <h1 className="sr-only">{HOME_HEADING}</h1>
      <JsonLd data={organizationJsonLd()} />
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <Logo3DViewer />

        <NavLinks ulClassName="flex flex-col items-center justify-center space-y-5 text-4xl md:mt-0 sm:flex-row sm:space-y-0 sm:gap-8 md:flex-col md:space-y-5 md:gap-0" />
      </div>
    </div>
  )
}
