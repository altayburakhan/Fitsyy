'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import Link from 'next/link'

type Row = { id: string; name: string; slug: string }

export default function Home() {
  useRequireAuth()
  const supabase = createSupabaseBrowserClient()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [err, setErr] = useState<string|null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user }, error: uerr } = await supabase.auth.getUser()
      if (uerr || !user) { setErr(uerr?.message || 'Kullanıcı bulunamadı'); return }

      const { data, error } = await supabase
        .from('user_tenants')
        .select('tenant_id, tenants:tenant_id(id,name,slug)')
        .eq('user_id', user.id)

      if (error) { setErr(error.message); return }
      const list = (data ?? []).map((r:any) => r.tenants).filter(Boolean) as Row[]

      // 0/1/çok kuralı
      if (list.length === 0) {
        location.href = '/t/create'
        return
      }
      if (list.length === 1) {
        location.href = `/t/${list[0].slug}`
        return
      }
      setRows(list)
    })()
  }, [])

  if (err) return <main className="p-6 text-red-600">{err}</main>
  if (!rows) return <main className="p-6">Yükleniyor…</main>

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Salonlarını Seç</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(t => (
          <a key={t.id} href={`/t/${t.slug}`} className="rounded border p-4 hover:bg-gray-50">
            <div className="text-lg font-medium">{t.name}</div>
            <div className="text-sm text-gray-600">/{t.slug}</div>
          </a>
        ))}
      </div>
      <div>
        <Link href="/t/create" className="px-3 py-2 rounded border">Salon Oluştur</Link>
      </div>
    </main>
  )
}
