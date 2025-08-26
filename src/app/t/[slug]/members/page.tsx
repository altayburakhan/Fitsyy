'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

type Member = { id: string; full_name: string; email: string | null; phone: string | null; status: string; created_at: string }

const PAGE_SIZE = 20

export default function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [items, setItems] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔎 server-side arama & sayfalama state
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  // tenant id cache
  const [tenantId, setTenantId] = useState<string>('')

  async function load() {
    setLoading(true)
    setErr(null)

    // 1) tenant
    if (!tenantId) {
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant bulunamadı'); setLoading(false); return }
      setTenantId(t.data.id)
    }

    // 2) query build
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('members')
      .select('id, full_name, email, phone, status, created_at', { count: 'exact' })
      .eq('tenant_id', tenantId || (await supabase.from('tenants').select('id').eq('slug', slug).single()).data?.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    const term = q.trim()
    if (term) {
      // full_name OR email OR phone ILIKE %q%
      // Supabase .or() formatı: field.ilike.%term%,field2.ilike.%term%...
      const pattern = `%${term}%`
      query = query.or(
        `full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`
      )
    }

    const { data, error, count } = await query
    if (error) setErr(error.message)
    else {
      setItems(data ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }

  // ilk load + her q/page değiştiğinde
  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, tenantId, q, page])

  // toplam sayfa
  const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])
  const canPrev = page > 1
  const canNext = page < pages

  // CSV dışa aktar (görünen filtreye göre tamamını indirir, sayfalama bağımsız)
  const downloadCSV = async () => {
    if (!tenantId) return
    let qAll = supabase
      .from('members')
      .select('full_name, email, phone, status, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    const term = q.trim()
    if (term) {
      const pattern = `%${term}%`
      qAll = qAll.or(
        `full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`
      )
    }

    const { data, error } = await qAll
    if (error) { alert(error.message); return }

    const header = ['Ad Soyad','E-posta','Telefon','Durum','Oluşturulma']
    const rows = (data ?? []).map(m => [
      m.full_name,
      m.email ?? '',
      m.phone ?? '',
      m.status,
      new Date(m.created_at).toISOString(),
    ])
    const csv = [header, ...rows].map(r =>
      r.map(cell => {
        const s = String(cell ?? '')
        return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s
      }).join(',')
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `members_${slug}_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Üyeler</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value) }}
            placeholder="Ada, 555..., mail..."
            className="border rounded p-2"
          />
          <button onClick={downloadCSV} className="px-3 py-2 rounded border">CSV indir</button>
          <a className="px-3 py-2 rounded bg-black text-white" href={`/t/${slug}/members/new`}>Yeni Üye</a>
        </div>
      </div>

      {loading ? (
        <p>Yükleniyor…</p>
      ) : (
        <>
          <ul className="divide-y">
            {items.map(m => (
              <li key={m.id} className="py-3">
                <a href={`/t/${slug}/members/${m.id}`} className="font-medium underline">
                  {m.full_name}
                </a>
                <div className="text-sm text-gray-600">
                  {m.email ?? '-'} · {m.phone ?? '-'} · {m.status}
                </div>
              </li>
            ))}
            {items.length === 0 && <li className="py-3 text-gray-500">Sonuç yok.</li>}
          </ul>

          {/* sayfalama */}
          <div className="flex items-center gap-2 pt-4">
            <button disabled={!canPrev} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-2 rounded border disabled:opacity-50">Önceki</button>
            <span className="text-sm">Sayfa {page}/{pages} • Toplam {total}</span>
            <button disabled={!canNext} onClick={() => setPage(p => p + 1)} className="px-3 py-2 rounded border disabled:opacity-50">Sonraki</button>
          </div>
        </>
      )}
    </main>
  )
}
