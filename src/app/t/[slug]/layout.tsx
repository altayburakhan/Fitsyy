// src/app/t/[slug]/layout.tsx
'use client'

import Link from 'next/link'
import { use, useEffect, useMemo, useState } from 'react'
import UserMenu from '@/components/UserMenu'
import RoleGate from '@/components/RoleGate'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Calendar,
  Users2,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
} from 'lucide-react'

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  // ── Collapsed state (persist)
  const [collapsed, setCollapsed] = useState<boolean>(false)
  useEffect(() => {
    const saved = localStorage.getItem('sidebar:collapsed')
    if (saved) setCollapsed(saved === '1')
  }, [])
  useEffect(() => {
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  // ── Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = useMemo(
    () => [
      { name: 'Dashboard', href: `/t/${slug}`, icon: Home },
      { name: 'Üyeler', href: `/t/${slug}/members`, icon: Users },
      { name: 'Takvim', href: `/t/${slug}/schedule`, icon: Calendar },
      { name: 'Eğitmenler', href: `/t/${slug}/trainers`, icon: Users2 },
      { name: 'Raporlar', href: `/t/${slug}/reports`, icon: BarChart3 },
    ],
    [slug]
  )

  // Basit aktif kontrolü (URL’e göre)
  const isActive = (href: string) =>
    typeof window !== 'undefined' && window.location?.pathname?.startsWith(href)

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(1000px_500px_at_110%_10%,rgba(59,130,246,0.06),transparent_60%),linear-gradient(to_bottom,#f8fafc,#ffffff)] dark:bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(1000px_500px_at_110%_10%,rgba(59,130,246,0.08),transparent_60%),linear-gradient(to_bottom,#0b0f14,#0a0a0a)]">
      {/* grid overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:32px_32px] [background-position:0_0,0_0]" />

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-black/50">
        <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
          {/* left cluster: toggle + brand */}
          <div className="flex items-center gap-2">
            {/* Sidebar toggle (md+) */}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-white shadow-sm transition hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              aria-label={collapsed ? 'Menüyü aç' : 'Menüyü daralt'}
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform',
                  collapsed ? 'rotate-180' : 'rotate-0'
                )}
              />
            </button>

            {/* Mobile drawer button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden inline-flex h-8 items-center gap-2 rounded-md border border-black/10 bg-white px-2 text-xs font-medium shadow-sm hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              Menü
            </button>

            <Link href="/" className="group inline-flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">
                Fitsyy
              </span>
            </Link>
          </div>

          {/* right cluster */}
          <div className="flex items-center gap-2">
            <RoleGate slug={slug} min="MANAGER">
              <Link
                href={`/t/${slug}/settings/invite`}
                className="inline-flex h-8 items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-xs font-medium shadow-sm hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <Settings className="h-4 w-4" />
                Davet Et
              </Link>
            </RoleGate>
            <UserMenu compact />
          </div>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="flex pt-14">
        {/* SIDEBAR (md+ collapsible) */}
        <aside
          className={cn(
            'sticky top-14 hidden h-[calc(100dvh-56px)] shrink-0 border-r border-black/5 bg-white/70 backdrop-blur transition-[width] duration-300 ease-in-out dark:border-white/10 dark:bg-neutral-950/60 md:block',
          )}
          style={{ width: collapsed ? 72 : 256 }} // px cinsinden animasyon
        >
          <nav className="px-2 py-4">
            {nav.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors',
                    active &&
                      'bg-neutral-100 text-neutral-900 ring-1 ring-black/5 dark:bg-neutral-900 dark:text-white dark:ring-white/10'
                  )}
                >
                  <Icon className="h-4 w-4 opacity-80 group-hover:opacity-100" />
                  {/* label animasyonu */}
                  <span
                    className={cn(
                      'origin-left transition-all duration-200',
                      collapsed
                        ? 'pointer-events-none w-0 scale-x-0 opacity-0'
                        : 'w-auto scale-x-100 opacity-100'
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-black/10 bg-neutral-950/90 px-3 py-4 backdrop-blur md:hidden">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-white">Navigasyon</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 rounded-md border border-white/15 text-white/80 hover:bg-white/5"
                >
                  ✕
                </button>
              </div>
              <nav className="space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </>
        )}

        {/* CONTENT */}
        <main className="w-full min-w-0 flex-1 px-4 pb-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
