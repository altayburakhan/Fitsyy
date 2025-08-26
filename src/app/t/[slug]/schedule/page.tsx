'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import RoleGate from '@/components/RoleGate'

type Slot = { id:string; title:string; type:'CLASS'|'PT'; start_at:string; end_at:string; capacity:number; trainer_id: string | null }
type Booking = { id:string; time_slot_id:string; status:'BOOKED'|'CANCELLED'|'NO_SHOW' }
type Trainer = { id:string; full_name:string }

export default function SchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [slots, setSlots] = useState<Slot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [trainerFilter, setTrainerFilter] = useState<string>('') // 🆕
  const [err, setErr] = useState<string | null>(null)

  // tarih filtreleri (senin önceki sürümün varsa koru; yoksa boş geçiyoruz)
  const [from, setFrom] = useState(''); const [to, setTo] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data: tenant, error: terr } = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (terr || !tenant) return setErr(terr?.message || 'Tenant yok')

      const [s, b, tr] = await Promise.all([
        supabase.from('time_slots')
          .select('id,title,type,start_at,end_at,capacity,trainer_id')
          .eq('tenant_id', tenant.id).order('start_at'),
        supabase.from('bookings')
          .select('id,time_slot_id,status')
          .eq('tenant_id', tenant.id),
        supabase.from('trainers')
          .select('id,full_name')
          .eq('tenant_id', tenant.id)
          .eq('active', true)
          .order('full_name'),
      ])
      if (s.error) return setErr(s.error.message)
      if (b.error) return setErr(b.error.message)
      if (tr.error) return setErr(tr.error.message)

      setSlots(s.data ?? [])
      setBookings(b.data ?? [])
      setTrainers(tr.data ?? [])
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const trainerName = (id: string | null) =>
    id ? (trainers.find(t => t.id === id)?.full_name ?? '') : ''

  const inDateRange = (iso: string) => {
    const ts = new Date(iso).getTime()
    const fromTs = from ? new Date(from+'T00:00:00').getTime() : -Infinity
    const toTs   = to   ? new Date(to  +'T23:59:59').getTime() : +Infinity
    return ts >= fromTs && ts <= toTs
  }

  const visibleSlots = useMemo(() => {
    return slots.filter(s =>
      (!from && !to || inDateRange(s.start_at)) &&
      (!trainerFilter || s.trainer_id === trainerFilter)
    )
  }, [slots, from, to, trainerFilter])

  const countBy = (slotId: string, status: Booking['status']) =>
    bookings.filter(b => b.time_slot_id === slotId && b.status === status).length
  const booked = (slotId: string) => countBy(slotId, 'BOOKED')
  const cancelled = (slotId: string) => countBy(slotId, 'CANCELLED')
  const noShow = (slotId: string) => countBy(slotId, 'NO_SHOW')

  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Takvim</h1>
        <RoleGate slug={slug} min="MANAGER">
          <a className="px-3 py-2 rounded bg-black text-white" href={`/t/${slug}/schedule/new`}>Yeni Slot</a>
        </RoleGate>
      </div>
      {/* Filtreler */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm text-gray-600">Başlangıç</label>
          <input type="date" className="border rounded p-2" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Bitiş</label>
          <input type="date" className="border rounded p-2" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Eğitmen</label>
          <select className="border rounded p-2" value={trainerFilter} onChange={e=>setTrainerFilter(e.target.value)}>
            <option value="">(Hepsi)</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </select>
        </div>
        <button className="border rounded px-3 py-2" onClick={()=>{ setFrom(''); setTo(''); setTrainerFilter('') }}>Temizle</button>
      </div>

      <ul className="divide-y">
        {visibleSlots.map(s => {
          const b = booked(s.id)
          const capFull = b >= s.capacity
          return (
            <li key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {s.title} • {s.type}
                  {trainerName(s.trainer_id) && <span className="text-xs px-2 py-0.5 rounded border">{trainerName(s.trainer_id)}</span>}
                  {capFull && <span className="text-xs px-2 py-0.5 rounded bg-red-100 border border-red-300">DOLU</span>}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(s.start_at).toLocaleString()} – {new Date(s.end_at).toLocaleTimeString()} •
                  {' '}Kapasite {b}/{s.capacity} • İptal {cancelled(s.id)} • No-Show {noShow(s.id)}
                </div>
              </div>
              <a className="text-blue-600" href={`/t/${slug}/schedule/${s.id}`}>Detay</a>
            </li>
          )
        })}
        {visibleSlots.length === 0 && <li className="py-3 text-gray-500">Filtreye uygun slot yok.</li>}
      </ul>
    </main>
  )
}
