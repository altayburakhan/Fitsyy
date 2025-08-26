'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { useTenantRole } from '@/lib/useTenantRole'
import { hasMinRole } from '@/lib/roles'

function slugify(input: string) {
  return input
    .toLowerCase().trim()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(1, 40) // min 1 char
}

export default function TenantSettings({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()
  const role = useTenantRole(slug)

  const [tenantId, setTenantId] = useState<string>('')
  const [name, setName] = useState('')
  const [slugVal, setSlugVal] = useState(slug)
  const [savingName, setSavingName] = useState(false)
  const [savingSlug, setSavingSlug] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const canManage = hasMinRole(role, 'MANAGER')
  const isOwner = hasMinRole(role, 'OWNER')

  useEffect(() => {
    ;(async () => {
      const t = await supabase.from('tenants').select('id,name,slug').eq('slug', slug).single()
      if (t.error || !t.data) { setErr(t.error?.message || 'Tenant bulunamadı'); return }
      setTenantId(t.data.id)
      setName(t.data.name)
      setSlugVal(t.data.slug)
    })()
  }, [slug])

  const submitName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManage) return
    setSavingName(true); setErr(null)
    const { error } = await supabase.rpc('update_tenant_name', { p_tenant: tenantId, p_name: name.trim() })
    setSavingName(false)
    if (error) setErr(error.message)
  }

  const submitSlug = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return
    const newSlug = slugify(slugVal) || slugVal
    setSavingSlug(true); setErr(null)
    const { error } = await supabase.rpc('update_tenant_slug', { p_tenant: tenantId, p_slug: newSlug })
    setSavingSlug(false)
    if (error) setErr(error.message)
    else location.href = `/t/${newSlug}/settings` // yeni slug'a geç
  }

  const transferOwner = async () => {
    if (!isOwner) return
    const email = prompt('Yeni sahibin e-postası?')
    if (!email) return
    // email → profile id
    const pr = await supabase.from('profiles').select('id').eq('email', email.trim()).single()
    if (pr.error || !pr.data) { alert('Kullanıcı bulunamadı'); return }
    const { error } = await supabase.rpc('transfer_ownership', { p_tenant: tenantId, p_new_owner: pr.data.id })
    if (error) alert(error.message); else alert('Sahiplik devredildi.')
  }

  const deleteTenant = async () => {
    if (!isOwner) return
    if (!confirm('Bu salon tamamen silinecek. Emin misin?')) return
    const { error } = await supabase.rpc('delete_tenant', { p_tenant: tenantId })
    if (error) alert(error.message)
    else location.href = '/'
  }

  const leaveTenant = async () => {
    if (!tenantId) return
    if (!confirm('Bu salondan ayrılmak istediğine emin misin?')) return
    const { error } = await supabase.rpc('leave_tenant', { p_tenant: tenantId })
    if (error) alert(error.message)
    else location.href = '/'
  }

  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="p-6 space-y-8 max-w-xl">
      <h1 className="text-xl font-semibold">Salon Ayarları</h1>

      {/* İSİM (MANAGER+) */}
      <section className="space-y-2">
        <h2 className="font-medium">Salon Adı</h2>
        <form onSubmit={submitName} className="flex gap-2">
          <input className="border rounded p-2 flex-1" value={name} onChange={e=>setName(e.target.value)} disabled={!canManage} />
          <button disabled={!canManage || savingName} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            Kaydet
          </button>
        </form>
        {!canManage && <p className="text-sm text-gray-600">Bu alan için MANAGER yetkisi gerekir.</p>}
      </section>

      {/* SLUG (OWNER) */}
      <section className="space-y-2">
        <h2 className="font-medium">Slug (URL)</h2>
        <form onSubmit={submitSlug} className="flex gap-2">
          <input className="border rounded p-2 flex-1" value={slugVal} onChange={e=>setSlugVal(e.target.value)} disabled={!isOwner}/>
          <button disabled={!isOwner || savingSlug} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            Güncelle
          </button>
        </form>
        {!isOwner && <p className="text-sm text-gray-600">Slug değiştirmek için OWNER yetkisi gerekir.</p>}
      </section>

      {/* SAHİPLİK DEVİR (OWNER) */}
      <section className="space-y-2">
        <h2 className="font-medium">Sahipliği Devret</h2>
        <button onClick={transferOwner} disabled={!isOwner} className="px-3 py-2 rounded border disabled:opacity-50">
          Yeni sahibin e-postasını gir
        </button>
        {!isOwner && <p className="text-sm text-gray-600">Sadece OWNER devredebilir.</p>}
      </section>

      {/* TEHLİKELİ ALAN */}
      <section className="space-y-2">
        <h2 className="font-medium text-red-600">Tehlikeli Alan</h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={leaveTenant} className="px-3 py-2 rounded border">Salondan Ayrıl</button>
          <button onClick={deleteTenant} disabled={!isOwner} className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50">
            Salonu Sil (OWNER)
          </button>
        </div>
      </section>
    </main>
  )
}
