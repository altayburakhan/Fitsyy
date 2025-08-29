// src/app/t/[slug]/page.tsx
'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { useTenantRole } from '@/lib/useTenantRole'
import { hasMinRole } from '@/lib/roles'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, TrendingUp, Plus, Settings, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Slot = {
  id: string
  title: string
  start_at: string
  end_at: string
  capacity: number
  trainer_id: string | null
}
type Booking = { id: string; time_slot_id: string; status: 'BOOKED' | 'CANCELLED' | 'NO_SHOW' }
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

  function toISO(d: Date) {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString()
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr(null)

      // 1) tenant id
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) {
        setErr(t.error?.message || 'Tenant yok')
        setLoading(false)
        return
      }
      const tid = t.data.id as string
      setTenantId(tid)

      // zaman aralığı: bugün → +7 gün
      const now = new Date()
      const until = new Date()
      until.setDate(until.getDate() + 7)
      const nowISO = toISO(now)
      const untilISO = toISO(until)

      // 2) paralel sorgular
      const [mCnt, slots, tr] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('tenant_id', tid),
        supabase
          .from('time_slots')
          .select('id,title,start_at,end_at,capacity,trainer_id')
          .eq('tenant_id', tid)
          .gte('start_at', nowISO)
          .lt('start_at', untilISO)
          .order('start_at', { ascending: true })
          .limit(10),
        supabase.from('trainers').select('id,full_name').eq('tenant_id', tid),
      ])

      if (mCnt.error) setErr(mCnt.error.message)
      if (slots.error) setErr(slots.error.message)
      if (tr.error) setErr(tr.error.message)

      setMembersCount(mCnt.count ?? 0)
      setUpcomingSlots((slots.data ?? []) as Slot[])
      setTrainers((tr.data ?? []) as Trainer[])

      // 3) bu slotların rezervasyonları
      const upIds = (slots.data ?? []).map((s: any) => s.id)
      if (upIds.length) {
        const b = await supabase
          .from('bookings')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const bookedMap = useMemo(() => {
    const m = new Map<string, number>()
    upcomingBookings.forEach((b) => {
      if (b.status !== 'BOOKED') return
      m.set(b.time_slot_id, (m.get(b.time_slot_id) ?? 0) + 1)
    })
    return m
  }, [upcomingBookings])

  const slotsBookedTotal = useMemo(
    () => Array.from(bookedMap.values()).reduce((a, b) => a + b, 0),
    [bookedMap]
  )

  const trainerName = (id: string | null) =>
    id ? trainers.find((t) => t.id === id)?.full_name ?? '(?)' : '—'

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="space-y-8">
      {/* Başlık + Aksiyonlar */}
      
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Salon Özeti</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/t/${slug}/members/new`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Üye
            </a>
          </Button>
          {canManage && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={`/t/${slug}/schedule/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Slot
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/t/${slug}/settings/invite`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Davet Et
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Toplam Üye"
          value={membersCount}
          description="Aktif salon üyeleri"
          icon={Users}
          variant="mint"
          kpi={membersCount ? '• canlı' : undefined}
        />
        <StatCard
          title="Yaklaşan Slot"
          value={upcomingSlots.length}
          description="Önümüzdeki 7 gün"
          icon={Calendar}
          variant="sky"
          kpi={upcomingSlots.length ? 'haftalık' : undefined}
        />
        <StatCard
          title="Toplam Rezervasyon"
          value={slotsBookedTotal}
          description="Yaklaşan slotlarda"
          icon={TrendingUp}
          variant="amber"
          // İstersen oran göstermek için progress kullan:
          progress={(() => {
            const capSum = upcomingSlots.reduce((a, s) => a + s.capacity, 0)
            if (!capSum) return 0
            const pct = (slotsBookedTotal / capSum) * 100
            return Math.round(pct)
          })()}
          kpi="doluluk"
        />
      </div>


            {/* Yaklaşan Slotlar (7 gün) */}
            <section className="space-y-4">
        {/* Başlık satırı */}
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Yaklaşan Slotlar <span className="text-neutral-400">/ 7 gün</span>
          </h2>

          {/* (opsiyonel) hızlı kısayol */}
          <a
            href={`/t/${slug}/schedule`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Takvime git →
          </a>
        </div>

        {/* Liste */}
        {upcomingSlots.length > 0 ? (
          <ul className="divide-y divide-neutral-200 dark:divide-white/10 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/60 dark:bg-neutral-950/40 backdrop-blur">
            {upcomingSlots.map((s) => {
              const booked = bookedMap.get(s.id) ?? 0
              const isFull = booked >= s.capacity
              const start = new Date(s.start_at)
              const end = new Date(s.end_at)
              const day = start.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })
              const time = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

              const pct = Math.max(0, Math.min(100, Math.round((booked / Math.max(1, s.capacity)) * 100)))

              return (
                <li key={s.id} className="group">
                  <a
                    href={`/t/${slug}/schedule/${s.id}`}
                    className="flex items-center gap-4 px-4 py-3 transition hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                  >
                    {/* Tarih rozeti */}
                    <div className="grid w-16 shrink-0 place-items-center rounded-xl border border-black/5 bg-white/70 p-2 text-center leading-tight ring-1 ring-black/5 dark:border-white/10 dark:bg-neutral-900/60 dark:ring-white/10">
                      <div className="text-[11px] uppercase text-neutral-500 dark:text-neutral-400">{day.split(' ')[0]}</div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{day.split(' ')[1]}</div>
                    </div>

                    {/* Başlık + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[15px] font-medium text-neutral-900 dark:text-neutral-100">
                          {s.title}
                        </h3>
                        {isFull ? (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-600 ring-1 ring-red-500/20">
                            DOLU
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-emerald-500/20">
                            {pct}% dolu
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                        {time} · Eğitmen: {trainerName(s.trainer_id)}
                      </p>
                    </div>

                    {/* Kapasite çipi + ilerleme çubuğu */}
                    <div className="hidden sm:flex w-56 items-center gap-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                        <div
                          className={cn('h-full rounded-full transition-all', isFull ? 'bg-red-500' : 'bg-emerald-500')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-medium ring-1',
                          isFull
                            ? 'bg-red-500/10 text-red-600 ring-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
                        )}
                      >
                        {booked}/{s.capacity}
                      </span>
                    </div>

                    {/* ok ikonu */}
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-1 h-4 w-4 shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          // Empty state
          <div className="grid place-items-center rounded-2xl border border-dashed border-neutral-200 bg-white/40 p-10 text-center ring-1 ring-black/5 dark:border-white/10 dark:bg-neutral-950/30 dark:ring-white/10">
            <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-neutral-200/50 text-neutral-500 dark:bg-white/10">
              {/* takvim simgesi */}
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Önümüzdeki <strong>7 günde</strong> slot yok.
            </p>
          </div>
        )}
      </section>

    </main>
  )
}
