'use client'

import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, CalendarDays } from 'lucide-react'
import MeasurementsCard from './_components/MeasurementsCard'

type Member = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: string
  created_at?: string
}

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  useRequireAuth()
  const { slug, memberId } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>('')
  const [m, setM] = useState<Member | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true); setErr(null)
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
      setTenantId(t.data.id as string)

      const mem = await supabase
        .from('members')
        .select('id, full_name, email, phone, status, created_at')
        .eq('tenant_id', t.data.id)
        .eq('id', memberId)
        .single()

      if (mem.error) setErr(mem.error.message)
      setM((mem.data ?? null) as Member | null)
      setLoading(false)
    })()
  }, [slug, memberId, supabase])

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>
  if (!m) return <main className="p-6">Üye bulunamadı.</main>

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/t/${slug}/members`}><ArrowLeft className="h-4 w-4 mr-1" /> Geri</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/t/${slug}/members/${m.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" /> Düzenle
            </Link>
          </Button>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h1 className="text-xl font-semibold">{m.full_name}</h1>
        <p className="text-sm text-gray-600">
          {m.email ?? '-'} · {m.phone ?? '-'} · {m.status}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Kayıt: {m.created_at ? new Date(m.created_at).toLocaleString() : '-'}
        </p>
      </section>

      {/* İleride: ölçümler, rezervasyon geçmişi vs. */}
      <section className="rounded-xl border bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
          <h2 className="font-medium">Rezervasyonlar (yakında)</h2>
        </div>
        <p className="text-sm text-gray-600">Bu alana üyenin rezervasyon geçmişi ve yaklaşan dersleri gelecek.</p>
        <MeasurementsCard slug={slug} memberId={memberId} />
      </section>
    </main>
  )
}
