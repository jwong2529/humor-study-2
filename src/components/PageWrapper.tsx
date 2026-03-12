'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/login' || pathname === '/unauthorized'

  if (isAuthPage) return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col">
        {children}
      </div>
    </div>
  )
}
