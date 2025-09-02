'use client'

import { useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

type Measurement = {
  id: string
  tenant_id: string
  member_id: string
  date: string
  weight: number | null
  body_fat: number | null
  height: number | null
  chest: number | null
  waist: number | null
  hip: number | null
  notes: string | null
  created_at: string
}

export default function MeasurementsCard({
  slug,
  memberId,
}: {
  slug: string
  memberId: string
}) {
  useRequireAuth()
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>('')
  const [rows, setRows] = useState<Measurement[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // form state
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [weight, setWeight] = useState<string>('')     // kg
  const [bodyFat, setBodyFat] = useState<string>('')   // %
  const [height, setHeight] = useState<string>('')     // cm
  const [chest, setChest] = useState<string>('')       // cm
  const [waist, setWaist] = useState<string>('')       // cm
  const [hip, setHip] = useState<string>('')           // cm
  const [notes, setNotes] = useState<string>('')

  async function load() {
    setLoading(true)
    setErr(null)

    // tenant
    const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
    if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
    setTenantId(t.data.id)

    // measurements
    const m = await supabase
      .from('measurements')
      .select('*')
      .eq('tenant_id', t.data.id)
      .eq('member_id', memberId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (m.error) setErr(m.error.message)
    else setRows((m.data || []) as Measurement[])
    setLoading(false)
  }

  useEffect(() => { load() }, [slug, memberId]) // eslint-disable-line

  const weights = useMemo(() => {
    const arr = rows
      .slice() // clone
      .reverse() // eski → yeni
      .map(r => (typeof r.weight === 'number' ? r.weight : null))
      .filter((x): x is number => x !== null)
    return arr
  }, [rows])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return
    setSaving(true); setErr(null)

    const payload: Omit<Measurement, 'id' | 'created_at'> = {
      tenant_id: tenantId,
      member_id: memberId,
      date,
      weight: weight ? Number(weight) : null,
      body_fat: bodyFat ? Number(bodyFat) : null,
      height: height ? Number(height) : null,
      chest: chest ? Number(chest) : null,
      waist: waist ? Number(waist) : null,
      hip: hip ? Number(hip) : null,
      notes: notes || null,
    } as any

    const ins = await supabase.from('measurements').insert(payload)
    setSaving(false)
    if (ins.error) { setErr(ins.error.message); return }
    // temizle ve yenile
    setNotes('')
    load()
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ölçümler</h2>
        {weights.length >= 2 && (
          <Sparkline values={weights} className="h-10 w-40 text-emerald-500" />
        )}
      </div>

      {/* form */}
      <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <input className="border rounded p-2" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input className="border rounded p-2" placeholder="Kilo (kg)" value={weight} onChange={e=>setWeight(e.target.value)} />
        <input className="border rounded p-2" placeholder="Yağ %" value={bodyFat} onChange={e=>setBodyFat(e.target.value)} />
        <input className="border rounded p-2" placeholder="Boy (cm)" value={height} onChange={e=>setHeight(e.target.value)} />
        <input className="border rounded p-2" placeholder="Göğüs (cm)" value={chest} onChange={e=>setChest(e.target.value)} />
        <input className="border rounded p-2" placeholder="Bel (cm)" value={waist} onChange={e=>setWaist(e.target.value)} />
        <input className="border rounded p-2" placeholder="Kalça (cm)" value={hip} onChange={e=>setHip(e.target.value)} />
        <input className="border rounded p-2 col-span-full" placeholder="Not" value={notes} onChange={e=>setNotes(e.target.value)} />
        <button disabled={saving} className="col-span-full md:col-span-2 rounded bg-black text-white px-4 py-2">
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </form>

      {err && <p className="text-sm text-red-600">{err}</p>}

      {/* liste */}
      {loading ? (
        <div className="text-sm text-gray-500">Yükleniyor…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-500">Henüz ölçüm yok.</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Tarih</Th>
                <Th>Kg</Th>
                <Th>Yağ %</Th>
                <Th>Boy</Th>
                <Th>Göğüs</Th>
                <Th>Bel</Th>
                <Th>Kalça</Th>
                <Th>Not</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <Td>{r.date}</Td>
                  <Td>{r.weight ?? '—'}</Td>
                  <Td>{r.body_fat ?? '—'}</Td>
                  <Td>{r.height ?? '—'}</Td>
                  <Td>{r.chest ?? '—'}</Td>
                  <Td>{r.waist ?? '—'}</Td>
                  <Td>{r.hip ?? '—'}</Td>
                  <Td className="max-w-[24rem] truncate" title={r.notes ?? ''}>{r.notes ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium text-gray-700">{children}</th>
}
function Td(
  { children, className = '', ...rest }: React.HTMLAttributes<HTMLTableCellElement>
) {
  return (
    <td {...rest} className={`px-3 py-2 ${className}`}>
      {children}
    </td>
  )
}

/** Basit sparkline (ekstra kütüphane yok) */
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const w = 160, h = 40
  const pad = 4
  const span = Math.max(1, max - min)

  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1)
    const y = pad + (h - pad * 2) * (1 - (v - min) / span)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className}>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={pts} />
    </svg>
  )
}
