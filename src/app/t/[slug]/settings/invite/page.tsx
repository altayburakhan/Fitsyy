'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

const ROLES = ['MANAGER','TRAINER','STAFF','MEMBER'] as const
type Role = typeof ROLES[number]

export default function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
    
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('STAFF')
  const [err, setErr] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    ;(async () => {
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) setErr(t.error?.message || 'Tenant bulunamadı')
      else setTenantId(t.data.id)
    })()
  }, [slug])

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setLink(null)
    if (!tenantId) return
    setSending(true)
    const { data, error } = await supabase.rpc('create_invite', {
      p_tenant: tenantId,
      p_email: email.trim(),
      p_role: role,
    })
    setSending(false)
    if (error) { setErr(error.message); return }
    const url = `${location.origin}/invite/${data.token}`  // kopyalanacak link
    setLink(url)
    // Eğer e-posta servisin varsa burada e-mail de atabilirsin.
  }

  return (
    <main className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Davet Et</h1>
      <form onSubmit={sendInvite} className="space-y-3">
        <input className="border rounded p-2 w-full" type="email" placeholder="personel@ornek.com" value={email} onChange={e=>setEmail(e.target.value)} required />
        <select className="border rounded p-2 w-full" value={role} onChange={e=>setRole(e.target.value as Role)}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={sending} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
          {sending ? 'Oluşturuluyor…' : 'Davet Linki Oluştur'}
        </button>
      </form>

      {link && (
        <div className="rounded border p-3 bg-gray-50">
          <div className="text-sm text-gray-600 mb-1">Bu linki personeline gönder:</div>
          <input readOnly value={link} className="border rounded p-2 w-full" onFocus={e=>e.currentTarget.select()} />
        </div>
      )}
    </main>
  )
}
