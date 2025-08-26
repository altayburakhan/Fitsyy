'use client'
import { usePathname } from 'next/navigation'
import HeaderGate from '@/components/HeaderGate'

export default function RootScaffold({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isTenant = pathname.startsWith('/t/')

  // /t/* altında: root hiçbir header/container vermesin
  if (isTenant) return <>{children}</>

  // tenant dışı: site header + container
  return (
    <>
      <HeaderGate />
      <main className="max-w-5xl mx-auto px-4">{children}</main>
    </>
  )
}
