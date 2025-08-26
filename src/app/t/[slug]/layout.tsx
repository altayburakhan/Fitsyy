// src/app/t/[slug]/layout.tsx
'use client'

import Link from 'next/link'
import { use } from 'react'
import UserMenu from '@/components/UserMenu'
import RoleGate from '@/components/RoleGate'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  Users2, 
  Settings, 
  Home,
  BarChart3,
  Building2
} from 'lucide-react'

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const navigation = [
    { name: 'Dashboard', href: `/t/${slug}`, icon: Home },
    { name: 'Üyeler', href: `/t/${slug}/members`, icon: Users },
    { name: 'Takvim', href: `/t/${slug}/schedule`, icon: Calendar },
    { name: 'Eğitmenler', href: `/t/${slug}/trainers`, icon: Users2 },
    { name: 'Raporlar', href: `/t/${slug}/reports`, icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Fitsyy</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <RoleGate slug={slug} min="MANAGER">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/t/${slug}/settings/invite`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Davet Et
                  </Link>
                </Button>
              </RoleGate>
              <UserMenu compact />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
