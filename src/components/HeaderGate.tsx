'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import UserMenu from '@/components/UserMenu'

export default function HeaderGate() {
  const pathname = usePathname()
  const showSiteHeader = !pathname.startsWith('/t/') // tenant altında root header yok
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session)
    })
  }, [])

  if (!showSiteHeader) return null
  if (isAuthed === null) return null // kısa bir yükleme anında flicker'ı önle

  const onLoginPage = pathname === '/login'
  const showCreateBtn = isAuthed && !onLoginPage

  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Fitsyy" className="h-7 w-auto" />
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {showCreateBtn && (
            <Link href="/t/create" className="px-3 py-1.5 rounded border">
              Salon Oluştur
            </Link>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}
