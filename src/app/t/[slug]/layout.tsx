// src/app/t/[slug]/layout.tsx
'use client'

import Link from 'next/link'
import { use } from 'react'
import UserMenu from '@/components/UserMenu'
import RoleGate from '@/components/RoleGate'

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  return (
    <div>
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo → root dashboard */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Fitsyy" className="h-7 w-auto" />
          </Link>

          <nav className="flex items-center gap-2 text-sm">
            <Link href={`/t/${slug}/members`} className="px-3 py-1.5 rounded border">Üyeler</Link>
            <Link href={`/t/${slug}/schedule`} className="px-3 py-1.5 rounded border">Takvim</Link>
            <Link href={`/t/${slug}/trainers`} className="px-3 py-1.5 rounded border">Eğitmenler</Link>
            <Link href={`/t/${slug}/settings`} className="px-3 py-1.5 rounded border">Ayarlar</Link>


            <RoleGate slug={slug} min="MANAGER">
              <Link href={`/t/${slug}/settings/invite`} className="px-3 py-1.5 rounded border">Davet Et</Link>
            </RoleGate>

            {/* Sağda kullanıcı menüsü: Giriş/Çıkış */}
            <UserMenu compact />
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4">{children}</div>
    </div>
  )
}
