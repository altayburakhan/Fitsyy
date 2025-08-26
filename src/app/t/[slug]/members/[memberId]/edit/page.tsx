'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

export default function EditMember({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  useRequireAuth()
  const { slug, memberId } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'ACTIVE'|'INACTIVE'>('ACTIVE')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
      setTenantId(t.data.id)

      const m = await supabase
        .from('members')
        .select('id, full_name, email, phone, status')
        .eq('id', memberId)
        .eq('tenant_id', t.data.id)
        .single()

      if (m.error || !m.data) { setErr(m.error?.message || 'Üye bulunamadı'); setLoading(false); return }

      setFullName(m.data.full_name ?? '')
      setEmail(m.data.email ?? '')
      setPhone(m.data.phone ?? '')
      setStatus(((m.data.status as string) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'))
      setLoading(false)
    })()
  }, [slug, memberId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!tenantId) return
    if (!fullName.trim()) return setErr('Ad Soyad gerekli.')

    setSaving(true)
    const { error } = await supabase
      .from('members')
      .update({
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        status,
      })
      .eq('id', memberId)
      .eq('tenant_id', tenantId)

    if (error) { setErr(error.message); setSaving(false); return }
    location.href = `/t/${slug}/members/${memberId}`
  }

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="p-6 space-y-4 max-w-lg">
      <h1 className="text-xl font-semibold">Üye Düzenle</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border rounded p-2 w-full" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        <input className="border rounded p-2 w-full" type="email" placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded p-2 w-full" placeholder="Telefon" value={phone} onChange={e=>setPhone(e.target.value)} />
        <select className="border rounded p-2 w-full" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex gap-2">
          <a href={`/t/${slug}/members/${memberId}`} className="px-3 py-2 rounded border">İptal</a>
          <button disabled={saving} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>
    </main>
  )
}
