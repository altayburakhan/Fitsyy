'use client'

import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'ACTIVE'|'INACTIVE'|'BANNED'>('ACTIVE')
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) setErr(t.error?.message || 'Tenant yok')
      else setTenantId(t.data.id as string)
    })()
  }, [slug, supabase])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setSaving(true)
    const ins = await supabase.from('members').insert({
      tenant_id: tenantId,
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      status,
    })
    setSaving(false)
    if (ins.error) { setErr(ins.error.message); return }
    location.href = `/t/${slug}/members`
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Yeni Üye</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/t/${slug}/members`}><ArrowLeft className="h-4 w-4 mr-1" /> Geri</Link>
        </Button>
      </div>

      <form onSubmit={submit} className="max-w-lg space-y-4 rounded-xl border bg-white p-5">
        <input
          className="w-full rounded-lg border p-2"
          placeholder="Ad Soyad"
          value={fullName}
          onChange={e=>setFullName(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border p-2"
          placeholder="E-posta"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border p-2"
          placeholder="Telefon"
          value={phone}
          onChange={e=>setPhone(e.target.value)}
        />
        <select
          className="w-full rounded-lg border p-2"
          value={status}
          onChange={e=>setStatus(e.target.value as any)}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="BANNED">BANNED</option>
        </select>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button disabled={saving}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
      </form>
    </main>
  )
}
