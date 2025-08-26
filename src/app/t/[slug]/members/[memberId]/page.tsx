'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

type Member = { id:string; full_name:string; email:string|null; phone:string|null; status:string; created_at:string }

export default function MemberDetail({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  useRequireAuth()
  const { slug, memberId } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [tenantId, setTenantId] = useState<string>()
  const [member, setMember] = useState<Member | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
      setTenantId(t.data.id)

      const m = await supabase
        .from('members')
        .select('id, full_name, email, phone, status, created_at, tenant_id')
        .eq('id', memberId)
        .eq('tenant_id', t.data.id)
        .single()

      if (m.error || !m.data) setErr(m.error?.message || 'Üye bulunamadı')
      else setMember(m.data as any)
      setLoading(false)
    })()
  }, [slug, memberId])

  const onDelete = async () => {
    if (!tenantId) return
    if (!confirm('Bu üyeyi silmek istediğine emin misin?')) return
    setDeleting(true)
    const { error } = await supabase.from('members').delete().eq('id', memberId).eq('tenant_id', tenantId)
    if (error) { alert(error.message); setDeleting(false); return }
    location.href = `/t/${slug}/members`
  }

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>
  if (!member) return <main className="p-6">Üye bulunamadı.</main>

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{member.full_name}</h1>
      <div className="text-sm text-gray-600">
        {member.email ?? '-'} · {member.phone ?? '-'} · {member.status}
      </div>

      <div className="flex gap-2">
        <a className="px-3 py-2 rounded border" href={`/t/${slug}/members`}>Geri</a>
        <a className="px-3 py-2 rounded bg-black text-white" href={`/t/${slug}/members/${memberId}/edit`}>Düzenle</a>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50"
        >
          {deleting ? 'Siliniyor…' : 'Sil'}
        </button>
      </div>
    </main>
  )
}
