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

      // 3) upcoming slot booking'leri çek (status=BOOKED ağırlık)
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Salon Özeti
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/t/${slug}/members/new`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Yeni Üye
            </a>
          </Button>
          {canManage && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={`/t/${slug}/schedule/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Slot
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/t/${slug}/settings/invite`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Davet Et
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Üye"
          value={membersCount}
          description="Aktif salon üyeleri"
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Yaklaşan Slot"
          value={upcomingSlots.length}
          description="Önümüzdeki 7 gün"
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="Toplam Rezervasyon"
          value={slotsBookedTotal}
          description="Yaklaşan slotlarda"
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Yaklaşan slotlar listesi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Yaklaşan Slotlar (7 gün)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingSlots.map(s => {
              const booked = bookedMap.get(s.id) ?? 0
              const isFull = booked >= s.capacity
              return (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(s.start_at).toLocaleString()} – {new Date(s.end_at).toLocaleTimeString()}
                      {' · '}Eğitmen: {trainerName(s.trainer_id)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-sm px-3 py-1 rounded-full font-medium",
                      isFull 
                        ? "bg-red-100 text-red-800 border border-red-200" 
                        : "bg-green-100 text-green-800 border border-green-200"
                    )}>
                      {booked}/{s.capacity}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/t/${slug}/schedule/${s.id}`}>Detay</a>
                    </Button>
                  </div>
                </div>
              )
            })}
            {upcomingSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Önümüzdeki 7 günde slot yok.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
