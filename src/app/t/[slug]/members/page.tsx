'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Search, UserPlus, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

type Member = { id: string; full_name: string; email: string | null; phone: string | null; status: string; created_at: string }

export default function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)

  const [items, setItems] = useState<Member[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState('') // 🔎 arama

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    ;(async () => {
      const { data: tenant, error: terr } =
        await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (terr || !tenant) return setErr(terr?.message || 'Tenant bulunamadı')

      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, email, phone, status, created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (error) setErr(error.message)
      else setItems(data ?? [])
    })()
  }, [slug])

  // 🔎 basit client-side filtre
  const filtered = useMemo(() => {
    if (!items) return null
    const term = q.trim().toLowerCase()
    if (!term) return items
    return items.filter(m => {
      const pack = `${m.full_name} ${m.email ?? ''} ${m.phone ?? ''}`.toLowerCase()
      return pack.includes(term)
    })
  }, [items, q])

  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>
  if (!filtered) return <main className="p-6">Yükleniyor…</main>

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Üyeler</h1>
        </div>
        <Button variant="default" size="lg" asChild>
          <a href={`/t/${slug}/members/new`}>
            <UserPlus className="h-5 w-5 mr-2" />
            Yeni Üye
          </a>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Ada, 555..., mail..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Üye Listesi</span>
            <span className="text-sm font-normal text-gray-500">
              {filtered.length} üye
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <a 
                      href={`/t/${slug}/members/${m.id}`} 
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {m.full_name}
                    </a>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      m.status === 'ACTIVE' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    )}>
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {m.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {m.email}
                      </div>
                    )}
                    {m.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {m.phone}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/t/${slug}/members/${m.id}`}>Detay</a>
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Henüz üye yok</p>
                <p className="text-sm">İlk üyenizi ekleyerek başlayın</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
