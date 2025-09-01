'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import Link from 'next/link'

type AcceptResp = { tenant_id: string; slug: string; role: 'OWNER'|'MANAGER'|'TRAINER'|'STAFF'|'MEMBER' }

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [state, setState] = useState<'checking'|'need-login'|'accepting'|'done'|'error'>('checking')
  const [message, setMessage] = useState<string>('Kontrol ediliyor…')
  const [redirectHref, setRedirectHref] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // Oturum var mı?
      const { data: s } = await supabase.auth.getSession()
      if (!mounted) return
      if (!s?.session) {
        // login’den dönüşte tekrar bu sayfaya gelebilmek için token’ı saklayalım (opsiyonel)
        try { localStorage.setItem('inviteToken', token) } catch {}
        setState('need-login')
        setMessage('Devam etmek için giriş yapmalısın.')
        return
      }

      // Oturum varsa daveti kabul et
      setState('accepting')
      setMessage('Davet kabul ediliyor…')
      const { data, error } = await supabase.rpc('accept_invite', { p_token: token })
      if (error) {
        setState('error')
        setMessage(error.message || 'Davet kabul edilirken hata oluştu.')
        return
      }

      const rows = (data ?? []) as AcceptResp[]
      const row = rows[0]
      if (!row) {
        setState('error')
        setMessage('Geçersiz veya kullanılmış davet.')
        return
      }

      setState('done')
      setMessage(`Davet kabul edildi. Rolün: ${row.role}`)
      setRedirectHref(`/t/${row.slug}`)
      // Kısa bekleyip otomatik yönlendir
      setTimeout(() => { location.href = `/t/${row.slug}` }, 1200)
    })()
    return () => { mounted = false }
  // supabase dependency’sini bilerek eklemiyoruz; instance stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (state === 'need-login') {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-xl font-semibold">Giriş gerekli</h1>
          <p className="text-sm text-gray-600">{message}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2"
          >
            Giriş Yap
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-xl font-semibold">Davet</h1>
        <p className={state === 'error' ? 'text-red-600' : 'text-gray-700'}>
          {message}
        </p>
        {redirectHref && (
          <Link href={redirectHref} className="text-blue-600 underline">
            Panele git
          </Link>
        )}
      </div>
    </main>
  )
}
