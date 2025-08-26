'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoading(false)
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Fitsyy • Dashboard</h1>

      {loading ? (
        <p>Yükleniyor…</p>
      ) : session ? (
        <>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-green-100 border">Giriş: {session.user.email}</span>
            <button onClick={logout} className="text-sm underline">Çıkış</button>
          </div>

          <div className="space-y-2">
            <a className="inline-block px-3 py-2 rounded bg-black text-white" href="/t/demo/members">Üyeler</a>
            <a className="inline-block px-3 py-2 rounded bg-black text-white ml-2" href="/t/demo/schedule">Takvim</a>
          </div>
        </>
      ) : (
        <>
          <p>Giriş yapmadın.</p>
          <a className="inline-block px-3 py-2 rounded bg-black text-white" href="/login">Giriş (Magic Link)</a>
          {/* Eğer şifreli giriş sayfası eklediysen: */}
          {/* <a className="inline-block px-3 py-2 rounded bg-black text-white ml-2" href="/login-password">E-posta & Şifre ile Giriş</a> */}
        </>
      )}
    </main>
  )
}
