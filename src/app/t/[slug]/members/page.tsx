'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { Users, Search, Plus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MemberRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | string
  created_at?: string
}

export default function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>('')
  const [rows, setRows] = useState<MemberRow[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true); setErr(null)
      // tenant id
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
      setTenantId(t.data.id as string)

      // üyeler
      const m = await supabase
        .from('members')
        .select('id, full_name, email, phone, status, created_at')
        .eq('tenant_id', t.data.id)
        .order('created_at', { ascending: false })

      if (m.error) setErr(m.error.message)
      setRows((m.data ?? []) as MemberRow[])
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(r =>
      (`${r.full_name} ${r.email ?? ''} ${r.phone ?? ''}`).toLowerCase().includes(term)
    )
  }, [rows, q])

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-semibold tracking-tight">Üyeler</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Ara: isim / mail / tel"
              className="h-10 w-64 rounded-lg border border-input bg-background/70 pl-9 pr-3 text-sm outline-none transition
                         focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
          <Button asChild>
            <Link href={`/t/${slug}/members/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Üye
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <ul className="space-y-2">
          {Array.from({length:6}).map((_,i)=>(
            <li key={i} className="h-16 rounded-xl border bg-card/60 animate-pulse" />
          ))}
        </ul>
      ) : err ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">Hata: {err}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Henüz üye yok. Sağ üstten yeni üye ekleyebilirsin.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-white">
          {filtered.map(m => (
            <li key={m.id} className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50">
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{m.full_name}</div>
                <div className="text-sm text-gray-600 truncate">
                  {m.email ?? '-'} · {m.phone ?? '-'} · {m.status}
                </div>
              </div>
              <Link
                href={`/t/${slug}/members/${m.id}`}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
              >
                Detay <ChevronRight className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
