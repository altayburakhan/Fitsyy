'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

type Member = { id: string; full_name: string; email: string | null; phone: string | null; status: string; created_at: string }

export default function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)

  const [items, setItems] = useState<Member[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState('') // 🔎 arama

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    ;(async () => {
      const { data: tenant, error: terr } =
        await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (terr || !tenant) return setErr(terr?.message || 'Tenant bulunamadı')

      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, email, phone, status, created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (error) setErr(error.message)
      else setItems(data ?? [])
    })()
  }, [slug])

  // 🔎 basit client-side filtre
  const filtered = useMemo(() => {
    if (!items) return null
    const term = q.trim().toLowerCase()
    if (!term) return items
    return items.filter(m => {
      const pack = `${m.full_name} ${m.email ?? ''} ${m.phone ?? ''}`.toLowerCase()
      return pack.includes(term)
    })
  }, [items, q])

  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>
  if (!filtered) return <main className="p-6">Yükleniyor…</main>

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Üyeler</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Ada, 555..., mail..."
            className="border rounded p-2"
          />
          <a className="px-3 py-2 rounded bg-black text-white" href={`/t/${slug}/members/new`}>Yeni Üye</a>
        </div>
      </div>

      <ul className="divide-y">
        {filtered.map(m => (
          <li key={m.id} className="py-3">
            <a href={`/t/${slug}/members/${m.id}`} className="font-medium underline">
              {m.full_name}
            </a>
            <div className="text-sm text-gray-600">
              {m.email ?? '-'} · {m.phone ?? '-'} · {m.status}
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="py-3 text-gray-500">Sonuç yok.</li>}
      </ul>
    </main>
  )
}
