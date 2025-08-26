'use client'
import { use, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

export default function NewSlot({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  useRequireAuth()

  // Next.js 15: params artık Promise → use() ile aç
  const { slug } = use(params)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'CLASS' | 'PT'>('CLASS')
  const [start, setStart] = useState('') // "YYYY-MM-DDTHH:mm"
  const [end, setEnd] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
    const supabase = createSupabaseBrowserClient()

    const { data: tenant, error: terr } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (terr || !tenant) {
      setErr(terr?.message || 'Tenant yok')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('time_slots').insert({
      tenant_id: tenant.id,
      title,
      type,
      start_at: startISO,
      end_at: endISO,
      capacity,
    })

    if (error) {
      setErr(error.message)
      setSaving(false)
      return
    }
    location.href = `/t/${slug}/schedule`
  }

  return (
    <main className="p-6 space-y-4 max-w-lg">
      <h1 className="text-xl font-semibold">Yeni Slot</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="border rounded p-2 w-full"
          placeholder="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select
          className="border rounded p-2 w-full"
          value={type}
          onChange={(e) => setType(e.target.value as 'CLASS' | 'PT')}
        >
          <option value="CLASS">CLASS</option>
          <option value="PT">PT</option>
        </select>

        <input
          className="border rounded p-2 w-full"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
        <input
          className="border rounded p-2 w-full"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />

        <input
          className="border rounded p-2 w-full"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value || '1', 10)))}
        />

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          disabled={saving}
          className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </form>
    </main>
  )
}
