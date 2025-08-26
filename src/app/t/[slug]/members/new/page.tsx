'use client'
import { use, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'

export default function NewMember({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  useRequireAuth()
  const { slug } = use(params)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!fullName.trim()) return setErr('Ad Soyad gerekli.')

    setSaving(true)
    const supabase = createSupabaseBrowserClient()

    // tenant_id bul
    const { data: tenant, error: terr } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (terr || !tenant) {
      setErr(terr?.message || 'Tenant bulunamadı')
      setSaving(false)
      return
    }

    // insert
    const { error } = await supabase.from('members').insert({
      tenant_id: tenant.id,
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
    })

    if (error) {
      setErr(error.message)
      setSaving(false)
      return
    }

    // başarı: üyeler listesine dön
    location.href = `/t/${slug}/members`
  }

  return (
    <main className="p-6 space-y-4 max-w-lg">
      <h1 className="text-xl font-semibold">Yeni Üye</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="border rounded p-2 w-full"
          placeholder="Ad Soyad"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className="border rounded p-2 w-full"
          placeholder="E-posta"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded p-2 w-full"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div className="flex gap-2">
          <a
            href={`/t/${slug}/members`}
            className="px-3 py-2 rounded border"
          >
            İptal
          </a>
          <button
            disabled={saving}
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>
    </main>
  )
}
