'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import ConsentBanner from './consent-banner'
import {
  acceptAnalytics,
  declineAnalytics,
  isConsentPending,
  startAnalytics,
} from '@/lib/analytics'

type AnalyticsConsent = {
  isEnabled: boolean
  openConsentBanner: () => void
}

const AnalyticsConsentContext = createContext<AnalyticsConsent>({
  isEnabled: false,
  openConsentBanner: () => {},
})

const subscribeToNothing = () => () => {}

export function useAnalyticsConsent(): AnalyticsConsent {
  return useContext(AnalyticsConsentContext)
}

interface AnalyticsProviderProps {
  apiKey: string
  children: ReactNode
}

export default function AnalyticsProvider({
  apiKey,
  children,
}: AnalyticsProviderProps) {
  useState(() => startAnalytics(apiKey))
  const isPending = useSyncExternalStore(
    subscribeToNothing,
    isConsentPending,
    () => false
  )
  const [hasChosen, setHasChosen] = useState(false)
  const [isReopened, setIsReopened] = useState(false)
  const isBannerOpen = isReopened || (isPending && !hasChosen)

  const consent = useMemo(
    () => ({ isEnabled: true, openConsentBanner: () => setIsReopened(true) }),
    []
  )

  const chooseWith = (choose: () => void) => () => {
    choose()
    setHasChosen(true)
    setIsReopened(false)
  }

  return (
    <AnalyticsConsentContext.Provider value={consent}>
      {children}
      {isBannerOpen && (
        <ConsentBanner
          onAccept={chooseWith(acceptAnalytics)}
          onDecline={chooseWith(declineAnalytics)}
        />
      )}
    </AnalyticsConsentContext.Provider>
  )
}
