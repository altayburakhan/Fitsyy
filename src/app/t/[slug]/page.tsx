'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { useTenantRole } from '@/lib/useTenantRole'
import { hasMinRole } from '@/lib/roles'

type Slot = { id: string; title: string; start_at: string; end_at: string; capacity: number; trainer_id: string | null }
type Booking = { id: string; time_slot_id: string; status: 'BOOKED'|'CANCELLED'|'NO_SHOW' }
type Trainer = { id: string; full_name: string }

export default function TenantDashboard({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()
  const role = useTenantRole(slug)

  const [tenantId, setTenantId] = useState<string>('')
  const [membersCount, setMembersCount] = useState(0)
  const [upcomingSlots, setUpcomingSlots] = useState<Slot[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const canManage = hasMinRole(role, 'MANAGER')

  function toISO(d: Date) { return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString() }

  useEffect(() => {
    ;(async () => {
      setLoading(true); setErr(null)
      // 1) tenant id
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
      const tid = t.data.id as string
      setTenantId(tid)

      // zaman penceresi: bugünden 7 gün sonrasına
      const now = new Date()
      const until = new Date(); until.setDate(until.getDate() + 7)
      const nowISO = toISO(now)
      const untilISO = toISO(until)

      // 2) counts + upcoming slots paralel
      const [mCnt, slots, tr] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('tenant_id', tid),
        supabase.from('time_slots')
          .select('id,title,start_at,end_at,capacity,trainer_id')
          .eq('tenant_id', tid)
          .gte('start_at', nowISO).lt('start_at', untilISO)
          .order('start_at', { ascending: true }).limit(10),
        supabase.from('trainers').select('id,full_name').eq('tenant_id', tid)
      ])

      if (mCnt.error) setErr(mCnt.error.message)
      if (slots.error) setErr(slots.error.message)
      if (tr.error) setErr(tr.error.message)

      setMembersCount(mCnt.count ?? 0)
      setUpcomingSlots((slots.data ?? []) as Slot[])
      setTrainers((tr.data ?? []) as Trainer[])

      // 3) upcoming slot booking’leri çek (status=BOOKED ağırlık)
      const upIds = (slots.data ?? []).map((s: any) => s.id)
      if (upIds.length) {
        const b = await supabase.from('bookings')
          .select('id,time_slot_id,status')
          .eq('tenant_id', tid)
          .in('time_slot_id', upIds)
        if (b.error) setErr(b.error.message)
        setUpcomingBookings((b.data ?? []) as Booking[])
      } else {
        setUpcomingBookings([])
      }

      setLoading(false)
    })()
  }, [slug])

  const bookedMap = useMemo(() => {
    const m = new Map<string, number>()
    upcomingBookings.forEach(b => {
      if (b.status !== 'BOOKED') return
      m.set(b.time_slot_id, (m.get(b.time_slot_id) ?? 0) + 1)
    })
    return m
  }, [upcomingBookings])

  const slotsBookedTotal = useMemo(
    () => Array.from(bookedMap.values()).reduce((a,b)=>a+b,0),
    [bookedMap]
  )

  const trainerName = (id: string | null) =>
    id ? (trainers.find(t => t.id === id)?.full_name ?? '(?)') : '—'

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-xl font-semibold">Salon Özeti</h1>

      {/* Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href={`/t/${slug}/members`} className="rounded border p-4 hover:bg-gray-50">
          <div className="text-2xl font-bold">{membersCount}</div>
          <div className="text-gray-600">Üye</div>
        </a>
        <a href={`/t/${slug}/schedule`} className="rounded border p-4 hover:bg-gray-50">
          <div className="text-2xl font-bold">{upcomingSlots.length}</div>
          <div className="text-gray-600">Yaklaşan Slot (7 gün)</div>
        </a>
        <a href={`/t/${slug}/schedule`} className="rounded border p-4 hover:bg-gray-50">
          <div className="text-2xl font-bold">{slotsBookedTotal}</div>
          <div className="text-gray-600">Yaklaşan Slotlarda Rezervasyon</div>
        </a>
      </div>

      {/* Hızlı aksiyonlar */}
      <div className="flex flex-wrap gap-2">
        <a href={`/t/${slug}/members/new`} className="px-3 py-2 rounded border">Yeni Üye</a>
        {canManage && (
          <>
            <a href={`/t/${slug}/schedule/new`} className="px-3 py-2 rounded border">Yeni Slot</a>
            <a href={`/t/${slug}/settings/invite`} className="px-3 py-2 rounded border">Davet Et</a>
          </>
        )}
      </div>

      {/* Yaklaşan slotlar listesi */}
      <section className="space-y-2">
        <h2 className="font-medium">Yaklaşan Slotlar (7 gün)</h2>
        <ul className="divide-y">
          {upcomingSlots.map(s => {
            const booked = bookedMap.get(s.id) ?? 0
            return (
              <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(s.start_at).toLocaleString()} – {new Date(s.end_at).toLocaleTimeString()}
                    {' · '}Eğitmen: {trainerName(s.trainer_id)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm px-2 py-0.5 rounded border">
                    {booked}/{s.capacity}
                  </span>
                  <a className="text-blue-600" href={`/t/${slug}/schedule/${s.id}`}>Detay</a>
                </div>
              </li>
            )
          })}
          {upcomingSlots.length === 0 && <li className="py-3 text-gray-500">Önümüzdeki 7 günde slot yok.</li>}
        </ul>
      </section>
    </main>
  )
}
