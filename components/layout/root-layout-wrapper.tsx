'use client'

import { usePathname } from 'next/navigation'
import { SearchHeader } from './search-header'
import { useEffect, Suspense } from 'react'

function RootLayoutContent({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      {pathname !== '/' && pathname !== '/search' && <SearchHeader />}
      <main className="flex-1">
        {children}
      </main>
    </>
  )
}

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="flex-1">{children}</main>}>
      <RootLayoutContent>{children}</RootLayoutContent>
    </Suspense>
  )
} 