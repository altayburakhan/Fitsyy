'use client'
import { use, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { use as usePromise } from 'react' // use ile çakışmaması için alias

export default function NewTrainer({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = usePromise(params)
  const supabase = createSupabaseBrowserClient()

  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!name.trim()) return setErr('İsim gerekli.')

    setSaving(true)
    const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
    if (t.error || !t.data) { setErr(t.error?.message || 'Tenant bulunamadı'); setSaving(false); return }

    const { error } = await supabase.from('trainers').insert({
      tenant_id: t.data.id,
      full_name: name.trim(),
      active,
    })
    setSaving(false)
    if (error) setErr(error.message)
    else location.href = `/t/${slug}/trainers`
  }

  return (
    <main className="p-6 space-y-4 max-w-lg">
      <h1 className="text-xl font-semibold">Yeni Eğitmen</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border rounded p-2 w-full" placeholder="Ad Soyad" value={name} onChange={e=>setName(e.target.value)} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
          Aktif
        </label>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex gap-2">
          <a href={`/t/${slug}/trainers`} className="px-3 py-2 rounded border">İptal</a>
          <button disabled={saving} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>
    </main>
  )
}
