// src/app/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Users, Dumbbell, Calendar, Plus, ArrowRight, Search } from 'lucide-react'
import HexBackdrop from '@/components/HexBackdrop'

type Tenant = { id: string; name: string; slug: string }
type Stats = { members: number; trainers: number; slots: number }

export default function Dashboard() {
  const supabase = createSupabaseBrowserClient()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [stats, setStats] = useState<Record<string, Stats>>({})
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // 1) Tenants’ı çek
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr(null)
    
      // aktif kullanıcı
      const { data: ures, error: uerr } = await supabase.auth.getUser()
      if (uerr || !ures?.user) {
        setErr('Oturum bulunamadı'); setLoading(false); return
      }
      const userId = ures.user.id
    
      // kullanıcının üye olduğu salonları çek (join)
      const { data, error } = await supabase
        .from('user_tenants')
        .select('tenant:tenants(id,name,slug)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    
      if (error) setErr(error.message)
    
      // map’le
      const items = (data ?? [])
        .map((r: any) => r.tenant)
        .filter(Boolean)
    
      setTenants(items as { id:string; name:string; slug:string }[])
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loading && !err && tenants.length === 0) {
      // otomatik yönlendirme istersen aç:
      // location.href = '/t/create'
    }
  }, [loading, err, tenants.length])
  
  // 2) Basit istatistikler (üyeler/eğitmenler/slotlar)
  useEffect(() => {
    if (!tenants.length) return
    ;(async () => {
      const results = await Promise.allSettled(
        tenants.map(async (t) => {
          const [m, tr, sl] = await Promise.all([
            supabase.from('members').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
            supabase.from('trainers').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
            supabase.from('time_slots').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
          ])
          return {
            id: t.id,
            stats: {
              members: m.count ?? 0,
              trainers: tr.count ?? 0,
              slots: sl.count ?? 0,
            } as Stats,
          }
        })
      )
      const map: Record<string, Stats> = {}
      results.forEach((r) => {
        if (r.status === 'fulfilled') map[r.value.id] = r.value.stats
      })
      setStats(map)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenants])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return tenants
    return tenants.filter((x) => `${x.name} ${x.slug}`.toLowerCase().includes(t))
  }, [tenants, q])

  return (
    <main className="relative">
      <HexBackdrop />

      {/* Üst başlık */}
      <div className="container max-w-6xl pt-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Salonlarını Seç</h1>
            <p className="text-sm text-muted-foreground">Hesabınla ilişkilendirilmiş salonlar.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara: isim / slug"
                className="h-10 w-56 rounded-lg border border-input bg-background/70 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/30"
              />
            </div>
            <Link
              href="/t/create"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white shadow hover:bg-emerald-400"
            >
              <Plus className="size-4" />
              Salon Oluştur
            </Link>
          </div>
        </header>
      </div>

      {/* İçerik */}
      <div className="container max-w-6xl pb-16">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm animate-pulse"
              />
            ))}
          </div>
        ) : err ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">Hata: {err}</div>
        ) : filtered.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/15 bg-card/40 p-10 text-center backdrop-blur-sm">
            <h3 className="text-lg font-medium">Salon bulunamadı</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yeni bir salon oluşturabilir veya arama terimini değiştirebilirsin.
            </p>
            <Link
              href="/t/create"
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white hover:bg-emerald-400"
            >
              <Plus className="size-4" />
              Yeni Salon Oluştur
            </Link>
          </section>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => {
              const s = stats[t.id] || { members: 0, trainers: 0, slots: 0 }
              return (
                <li key={t.id}>
                  <Link
                    href={`/t/${t.slug}`}
                    className="group relative block rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-md transition
                               hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,.5)]"
                  >
                    {/* neon/gradient vuruş */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100"
                      style={{
                        background:
                          'radial-gradient(120% 80% at 100% 0%, rgba(16,185,129,.16), transparent 60%)',
                      }}
                    />
                    <div className="relative">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold tracking-tight">{t.name}</h3>
                        <span className="rounded-md border border-white/10 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                          /{t.slug}
                        </span>
                      </div>

                      {/* mini istatistikler */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <Stat chip icon={Users} label="Üye" value={s.members} />
                        <Stat chip icon={Dumbbell} label="Eğitmen" value={s.trainers} />
                        <Stat chip icon={Calendar} label="Slot" value={s.slots} />
                      </div>

                      <div className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-400">
                        Yönetim paneline git
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  chip = false,
}: {
  icon: any
  label: string
  value: number
  chip?: boolean
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 ${
        chip
          ? 'rounded-md border border-white/10 bg-background/40 px-2 py-1'
          : ''
      }`}
    >
      <Icon className="size-4 text-emerald-400/90" />
      <span className="text-white/90 font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
