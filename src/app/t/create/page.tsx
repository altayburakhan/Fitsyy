'use client'
import { useEffect, useMemo, useState } from 'react'
import { use as usePromise } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0, 40)
}

export default function CreateTenantPage() {
  useRequireAuth()
  const supabase = createSupabaseBrowserClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Ad değiştikçe slug öner
  useEffect(() => {
    if (!name) { setSlug(''); return }
    const s = slugify(name)
    setSlug(s)
  }, [name])

  // slug uygun mu? (debounce basit)
  useEffect(() => {
    let alive = true
    ;(async () => {
      setAvailable(null)
      if (!slug) return
      setChecking(true)
      const { data, error } = await supabase.from('tenants').select('id').eq('slug', slug).maybeSingle()
      if (!alive) return
      setChecking(false)
      if (error) { setAvailable(null); return }
      setAvailable(data ? false : true)
    })()
    return () => { alive = false }
  }, [slug])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!name.trim()) return setErr('İsim gerekli.')
    if (!slug) return setErr('Slug gerekli.')
    if (available === false) return setErr('Bu slug kullanılıyor, lütfen değiştirin.')

    setSaving(true)
    const { data: { user }, error: uerr } = await supabase.auth.getUser()
    if (uerr || !user) { setSaving(false); return setErr(uerr?.message || 'Kullanıcı bulunamadı.') }

    const { data, error } = await supabase.rpc('create_tenant_and_assign_owner', {
      p_name: name.trim(),
      p_slug: slug,
      p_user: user.id,
    })
    setSaving(false)
    if (error) return setErr(error.message)

    // başarı → üyeler sayfasına
    location.href = `/t/${slug}/members`
  }

  return (
    <main className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Yeni Salon Oluştur</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm text-gray-600">Salon Adı</span>
          <input
            className="border rounded p-2 w-full"
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="Örn. Fitsyy Kadıköy"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Slug (URL)</span>
          <input
            className="border rounded p-2 w-full"
            value={slug}
            onChange={e=>setSlug(slugify(e.target.value))}
            placeholder="fitsyy-kadikoy"
            required
          />
          <div className="text-xs text-gray-600 mt-1">
            URL: <code>/t/{slug || '<slug>'}</code>
            {slug && (
              <span className="ml-2">
                {checking ? '• kontrol ediliyor…' : available === null ? '' : available ? '• uygun ✅' : '• kullanımda ❌'}
              </span>
            )}
          </div>
        </label>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {saving ? 'Oluşturuluyor…' : 'Oluştur'}
        </button>
      </form>
    </main>
  )
}
