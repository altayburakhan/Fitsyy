'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type Measurement = {
  id: string
  date: string
  weight: number | null
  body_fat: number | null
  height: number | null
  chest: number | null
  waist: number | null
  hip: number | null
  notes: string | null
}

export default function MeasurementsList({ slug, memberId }: { slug: string, memberId: string }) {
  const supabase = createSupabaseBrowserClient()
  const [rows, setRows] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true); setErr(null)
      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (!tenant) { setErr('Tenant bulunamadı'); setLoading(false); return }

      const res = await supabase
        .from('measurements')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('member_id', memberId)
        .order('date', { ascending: false })

      if (res.error) setErr(res.error.message)
      setRows((res.data ?? []) as Measurement[])
      setLoading(false)
    })()
  }, [slug, memberId, supabase])

  if (loading) return <p>Yükleniyor…</p>
  if (err) return <p className="text-red-600">Hata: {err}</p>
  if (rows.length === 0) return <p className="text-gray-500">Henüz ölçüm yok.</p>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Tarih</th>
            <th className="px-3 py-2">Kilo</th>
            <th className="px-3 py-2">Yağ %</th>
            <th className="px-3 py-2">Boy</th>
            <th className="px-3 py-2">Göğüs</th>
            <th className="px-3 py-2">Bel</th>
            <th className="px-3 py-2">Kalça</th>
            <th className="px-3 py-2">Not</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="odd:bg-white even:bg-gray-50">
              <td className="px-3 py-2">{new Date(r.date).toLocaleDateString()}</td>
              <td className="px-3 py-2">{r.weight ?? '-'}</td>
              <td className="px-3 py-2">{r.body_fat ?? '-'}</td>
              <td className="px-3 py-2">{r.height ?? '-'}</td>
              <td className="px-3 py-2">{r.chest ?? '-'}</td>
              <td className="px-3 py-2">{r.waist ?? '-'}</td>
              <td className="px-3 py-2">{r.hip ?? '-'}</td>
              <td className="px-3 py-2">{r.notes ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
