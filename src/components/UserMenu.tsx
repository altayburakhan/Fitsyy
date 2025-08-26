'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function UserMenu({ compact = false }: { compact?: boolean }) {
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setEmail(session?.user?.email || undefined)
      setLoading(false)
    })()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    // çıkıştan sonra login sayfasına
    location.href = '/login'
  }

  if (loading) return null

  // oturum yoksa "Giriş" butonu
  if (!email) {
    return <Link href="/login" className="px-3 py-1.5 rounded border">Giriş</Link>
  }

  // oturum varsa e-posta + Çıkış
  return (
    <div className="flex items-center gap-2">
      {!compact && <span className="text-sm text-gray-600 hidden sm:inline">{email}</span>}
      <button onClick={signOut} className="px-3 py-1.5 rounded border">Çıkış</button>
    </div>
  )
}
