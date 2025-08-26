'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

type Trainer = { id: string; full_name: string; active: boolean }

export default function TrainersPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [items, setItems] = useState<Trainer[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) return setErr(t.error?.message || 'Tenant bulunamadı')
      const tr = await supabase
        .from('trainers')
        .select('id, full_name, active')
        .eq('tenant_id', t.data.id)
        .order('full_name')
      if (tr.error) setErr(tr.error.message)
      else setItems(tr.data ?? [])
    })()
  }, [slug])

  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>
  if (!items) return <main className="p-6">Yükleniyor…</main>

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Eğitmenler</h1>
        <a className="px-3 py-2 rounded bg-black text-white" href={`/t/${slug}/trainers/new`}>Yeni Eğitmen</a>
      </div>

      <ul className="divide-y">
        {items.map(tr => (
          <li key={tr.id} className="py-3">
            <a href={`/t/${slug}/trainers/${tr.id}/edit`} className="font-medium underline">{tr.full_name}</a>
            <div className="text-sm text-gray-600">{tr.active ? 'Aktif' : 'Pasif'}</div>
          </li>
        ))}
        {items.length === 0 && <li className="py-3 text-gray-500">Henüz eğitmen yok.</li>}
      </ul>
    </main>
  )
}
