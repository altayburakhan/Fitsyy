'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { use as usePromise } from 'react'

export default function EditTrainer({ params }: { params: Promise<{ slug: string; id: string }> }) {
  useRequireAuth()
  const { slug, id } = usePromise(params)
  const supabase = createSupabaseBrowserClient()

  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ;(async () => {
      const tr = await supabase.from('trainers').select('full_name, active, tenant_id').eq('id', id).single()
      if (tr.error || !tr.data) { setErr(tr.error?.message || 'Eğitmen bulunamadı'); setLoading(false); return }
      setName(tr.data.full_name); setActive(!!tr.data.active); setLoading(false)
    })()
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!name.trim()) return setErr('İsim gerekli.')
    setSaving(true)
    const { error } = await supabase.from('trainers').update({
      full_name: name.trim(),
      active,
    }).eq('id', id)
    setSaving(false)
    if (error) setErr(error.message)
    else location.href = `/t/${slug}/trainers`
  }

  const onDelete = async () => {
    if (!confirm('Eğitmeni silmek istediğine emin misin? Bu işlem geri alınamaz.')) return
    setDeleting(true)
    const { error } = await supabase.from('trainers').delete().eq('id', id)
    setDeleting(false)
    if (error) alert(error.message)
    else location.href = `/t/${slug}/trainers`
  }

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>

  return (
    <main className="p-6 space-y-4 max-w-lg">
      <h1 className="text-xl font-semibold">Eğitmen Düzenle</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border rounded p-2 w-full" value={name} onChange={e=>setName(e.target.value)} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
          Aktif
        </label>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex gap-2">
          <a href={`/t/${slug}/trainers`} className="px-3 py-2 rounded border">Geri</a>
          <button disabled={saving} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
          <button type="button" disabled={deleting} onClick={onDelete} className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50">
            {deleting ? 'Siliniyor…' : 'Sil'}
          </button>
        </div>
      </form>
    </main>
  )
}
