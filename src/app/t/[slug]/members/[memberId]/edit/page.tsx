'use client'

import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ClipboardList, Plus } from 'lucide-react'
import MeasurementsList from '@/components/MeasurementsList'

type Member = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: 'ACTIVE'|'INACTIVE'|'BANNED'|string
}

export default function EditMemberPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  useRequireAuth()
  const { slug, memberId } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>('')
  const [m, setM] = useState<Member | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true); setErr(null)
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
      setTenantId(t.data.id as string)

      const mem = await supabase
        .from('members')
        .select('id, full_name, email, phone, status')
        .eq('tenant_id', t.data.id)
        .eq('id', memberId)
        .single()

      if (mem.error) setErr(mem.error.message)
      setM((mem.data ?? null) as Member | null)
      setLoading(false)
    })()
  }, [slug, memberId, supabase])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!m) return
    setErr(null); setSaving(true)
    const upd = await supabase
      .from('members')
      .update({
        full_name: m.full_name.trim(),
        email: (m.email ?? '').trim() || null,
        phone: (m.phone ?? '').trim() || null,
        status: m.status,
      })
      .eq('id', m.id)
      .eq('tenant_id', tenantId)

    setSaving(false)
    if (upd.error) { setErr(upd.error.message); return }
    location.href = `/t/${slug}/members/${m.id}`
  }

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>
  if (!m) return <main className="p-6">Üye bulunamadı.</main>

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Üye Düzenle</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/t/${slug}/members/${m.id}`}><ArrowLeft className="h-4 w-4 mr-1" /> Geri</Link>
        </Button>
      </div>

      <form onSubmit={submit} className="max-w-lg space-y-4 rounded-xl border bg-white p-5">
        <input
          className="w-full rounded-lg border p-2"
          value={m.full_name}
          onChange={e=>setM(prev=>prev ? {...prev, full_name: e.target.value} : prev)}
          required
        />
        <input
          className="w-full rounded-lg border p-2"
          placeholder="E-posta"
          type="email"
          value={m.email ?? ''}
          onChange={e=>setM(prev=>prev ? {...prev, email: e.target.value} : prev)}
        />
        <input
          className="w-full rounded-lg border p-2"
          placeholder="Telefon"
          value={m.phone ?? ''}
          onChange={e=>setM(prev=>prev ? {...prev, phone: e.target.value} : prev)}
        />
        <select
          className="w-full rounded-lg border p-2"
          value={m.status}
          onChange={e=>setM(prev=>prev ? {...prev, status: e.target.value as any} : prev)}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="BANNED">BANNED</option>
        </select>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button disabled={saving}>{saving ? 'Kaydediliyor…' : 'Güncelle'}</Button>
      </form>
      <MeasurementsList slug={slug} memberId={m.id} />
    </main>
  )
}
