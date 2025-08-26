'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

type Slot = { id:string; title:string; type:'CLASS'|'PT'; start_at:string; end_at:string; capacity:number }
type Booking = { id:string; time_slot_id:string; member_id:string; status:'BOOKED'|'CANCELLED'|'NO_SHOW' }

export default function SchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)

  const [slots, setSlots] = useState<Slot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [err, setErr] = useState<string | null>(null)

  // filtre state
  const [from, setFrom] = useState<string>('')   // "YYYY-MM-DD"
  const [to, setTo]     = useState<string>('')   // "YYYY-MM-DD"

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    ;(async () => {
      const { data: tenant, error: terr } =
        await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (terr || !tenant) return setErr(terr?.message || 'Tenant yok')

      const [s, b] = await Promise.all([
        supabase.from('time_slots')
          .select('id,title,type,start_at,end_at,capacity')
          .eq('tenant_id', tenant.id)
          .order('start_at'),
        supabase.from('bookings')
          .select('id,time_slot_id,member_id,status')
          .eq('tenant_id', tenant.id),
      ])
      if (s.error) return setErr(s.error.message)
      if (b.error) return setErr(b.error.message)

      setSlots(s.data ?? [])
      setBookings(b.data as Booking[] ?? [])
    })()
  }, [slug])

  // tarih aralığına göre filtrelenmiş slotlar
  const filteredSlots = useMemo(() => {
    if (!from && !to) return slots
    const fromTs = from ? new Date(from + 'T00:00:00').getTime() : -Infinity
    const toTs   = to   ? new Date(to   + 'T23:59:59').getTime() : +Infinity
    return slots.filter(s => {
      const ts = new Date(s.start_at).getTime()
      return ts >= fromTs && ts <= toTs
    })
  }, [slots, from, to])

  const countBy = (slotId: string, status: Booking['status']) =>
    bookings.filter(b => b.time_slot_id === slotId && b.status === status).length
  const booked    = (slotId: string) => countBy(slotId, 'BOOKED')
  const cancelled = (slotId: string) => countBy(slotId, 'CANCELLED')
  const noShow    = (slotId: string) => countBy(slotId, 'NO_SHOW')

  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Takvim</h1>
        <a className="px-3 py-2 rounded bg-black text-white inline-block" href={`/t/${slug}/schedule/new`}>Yeni Slot</a>
      </div>

      {/* Tarih filtresi */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm text-gray-600">Başlangıç</label>
          <input type="date" className="border rounded p-2" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Bitiş</label>
          <input type="date" className="border rounded p-2" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <button className="border rounded px-3 py-2" onClick={()=>{ setFrom(''); setTo('') }}>Temizle</button>
        {/* hızlı kısayollar */}
        <button className="border rounded px-3 py-2" onClick={()=>{
          const d = new Date(); const iso = d.toISOString().slice(0,10)
          setFrom(iso); setTo(iso)
        }}>Bugün</button>
        <button className="border rounded px-3 py-2" onClick={()=>{
          const now = new Date()
          const start = new Date(now); start.setDate(now.getDate() - now.getDay()) // pazar
          const end   = new Date(start); end.setDate(start.getDate() + 6)
          setFrom(start.toISOString().slice(0,10))
          setTo(end.toISOString().slice(0,10))
        }}>Bu Hafta</button>
        <button className="border rounded px-3 py-2" onClick={()=>{
          const now = new Date()
          const start = new Date(now.getFullYear(), now.getMonth(), 1)
          const end   = new Date(now.getFullYear(), now.getMonth()+1, 0)
          setFrom(start.toISOString().slice(0,10))
          setTo(end.toISOString().slice(0,10))
        }}>Bu Ay</button>
      </div>

      <ul className="divide-y">
        {filteredSlots.map(s => {
          const b = booked(s.id)
          const capFull = b >= s.capacity
          return (
            <li key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {s.title} • {s.type}
                  {capFull && <span className="text-xs px-2 py-0.5 rounded bg-red-100 border border-red-300">DOLU</span>}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(s.start_at).toLocaleString()} – {new Date(s.end_at).toLocaleTimeString()} •
                  {' '}Kapasite {b}/{s.capacity}
                  {' '}• İptal {cancelled(s.id)} • No-Show {noShow(s.id)}
                </div>
              </div>
              <a className="text-blue-600" href={`/t/${slug}/schedule/${s.id}`}>Detay</a>
            </li>
          )
        })}
        {filteredSlots.length === 0 && <li className="py-3 text-gray-500">Filtreye uygun slot yok.</li>}
      </ul>
    </main>
  )
}
