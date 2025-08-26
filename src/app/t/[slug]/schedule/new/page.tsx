'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import RoleGate from '@/components/RoleGate'

type Trainer = { id: string; full_name: string }

export default function NewSlot({ params }: { params: Promise<{ slug: string }> }) {
  
  useRequireAuth()
  const { slug } = use(params)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'CLASS' | 'PT'>('CLASS')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [trainerId, setTrainerId] = useState<string>('') // 🆕
  const [trainers, setTrainers] = useState<Trainer[]>([]) // 🆕
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    ;(async () => {
      // tenant id al
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) return setErr(t.error?.message || 'Tenant yok')

      // aktif trainer listesi
      const tr = await supabase
        .from('trainers')
        .select('id, full_name')
        .eq('tenant_id', t.data.id)
        .eq('active', true)
        .order('full_name')
      if (tr.error) setErr(tr.error.message)
      else setTrainers((tr.data ?? []) as Trainer[])
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!start || !end) return setErr('Başlangıç ve bitiş zamanı gerekli.')
    const startISO = new Date(start).toISOString()
    const endISO = new Date(end).toISOString()
    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      return setErr('Bitiş, başlangıçtan sonra olmalı.')
    }

    setSaving(true)
    // tenant
    const { data: tenant, error: terr } = await supabase.from('tenants').select('id').eq('slug', slug).single()
    if (terr || !tenant) { setErr(terr?.message || 'Tenant yok'); setSaving(false); return }

    // insert
    const { error } = await supabase.from('time_slots').insert({
      tenant_id: tenant.id,
      title, type,
      start_at: startISO,
      end_at: endISO,
      capacity,
      trainer_id: trainerId || null, // 🆕
    })
    if (error) { setErr(error.message); setSaving(false); return }
    location.href = `/t/${slug}/schedule`
  }

  return (
    <RoleGate
      slug={slug}
      min="MANAGER"
      fallback={<main className="p-6 text-gray-600">Bu işlem için yetkin yok.</main>}
    >
      <main className="p-6 space-y-4 max-w-lg">
        <h1 className="text-xl font-semibold">Yeni Slot</h1>
        <form onSubmit={submit} className="space-y-3">
          <input className="border rounded p-2 w-full" placeholder="Başlık" value={title} onChange={e=>setTitle(e.target.value)} required />
          <select className="border rounded p-2 w-full" value={type} onChange={e=>setType(e.target.value as 'CLASS'|'PT')}>
            <option value="CLASS">CLASS</option>
            <option value="PT">PT</option>
          </select>
          <input className="border rounded p-2 w-full" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} required />
          <input className="border rounded p-2 w-full" type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} required />
          <input className="border rounded p-2 w-full" type="number" min={1} value={capacity} onChange={e=>setCapacity(Math.max(1, parseInt(e.target.value || '1',10)))} />

          {/* Eğitmen seçimi (opsiyonel) */}
          <select className="border rounded p-2 w-full" value={trainerId} onChange={e=>setTrainerId(e.target.value)}>
            <option value="">(Eğitmen seç — opsiyonel)</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </select>

          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button disabled={saving} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </form>
      </main>
    </RoleGate>
  )
} 
