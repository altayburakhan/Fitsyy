'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function AcceptInvite({ params }: { params: { token: string } }) {
  const supabase = createSupabaseBrowserClient()
  const [msg, setMsg] = useState('Davet kontrol ediliyor…')

  useEffect(() => {
    ;(async () => {
      // Kullanıcı login değilse /login'e al, login sonrası bu sayfaya döner
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { location.href = `/login?next=${encodeURIComponent(location.pathname)}`; return }

      const { data, error } = await supabase.rpc('accept_invite', { p_token: params.token })
      if (error) { setMsg('Hata: ' + error.message); return }
      // data = tenant_id; slug'ı almak için sorgu
      const t = await supabase.from('tenants').select('slug').eq('id', data as string).single()
      if (t.error || !t.data) { setMsg('Katılım başarılı, fakat yönlendirme hatası.'); return }
      location.href = `/t/${t.data.slug}`
    })()
  }, [params.token])

  return <main className="p-6">{msg}</main>
}
