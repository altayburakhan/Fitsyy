'use client'

import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewMeasurementPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  useRequireAuth()
  const { slug, memberId } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>('')
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [height, setHeight] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string|null>(null)

  useEffect(() => {
    ;(async () => {
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.data) setTenantId(t.data.id)
    })()
  }, [slug, supabase])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setErr(null)
    const res = await supabase.from('measurements').insert({
      tenant_id: tenantId,
      member_id: memberId,
      weight: weight || null,
      body_fat: bodyFat || null,
      height: height || null,
      notes: notes || null,
    })
    setSaving(false)
    if (res.error) { setErr(res.error.message); return }
    location.href = `/t/${slug}/members/${memberId}`
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Yeni Ölçüm</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/t/${slug}/members/${memberId}`}><ArrowLeft className="h-4 w-4 mr-1" /> Geri</Link>
        </Button>
      </div>

      <form onSubmit={submit} className="max-w-lg space-y-4 rounded-xl border bg-white p-5">
        <input className="w-full rounded border p-2" placeholder="Kilo (kg)" value={weight} onChange={e=>setWeight(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Yağ %" value={bodyFat} onChange={e=>setBodyFat(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Boy (cm)" value={height} onChange={e=>setHeight(e.target.value)} />
        <textarea className="w-full rounded border p-2" placeholder="Notlar" value={notes} onChange={e=>setNotes(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button disabled={saving}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
      </form>
    </main>
  )
}
