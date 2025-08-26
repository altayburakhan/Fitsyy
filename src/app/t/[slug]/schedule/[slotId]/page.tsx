'use client'
import { use, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import RoleGate from '@/components/RoleGate'

type Member = { id: string; full_name: string; email?: string|null; phone?: string|null }
type Booking = { id: string; member_id: string; status: 'BOOKED'|'CANCELLED'|'NO_SHOW' }
type Slot = { id:string; title:string; start_at:string; end_at:string; capacity:number; trainer_id: string|null } // 🆕
type Trainer = { id: string; full_name: string } // 🆕

export default function SlotDetail({ params }: { params: Promise<{ slug: string; slotId: string }> }) {
  useRequireAuth()
  const { slug, slotId } = use(params)

  const supabase = createSupabaseBrowserClient()
  const [tenantId, setTenantId] = useState<string>()
  const [slot, setSlot] = useState<Slot | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])            // 🆕
  const [updatingTrainer, setUpdatingTrainer] = useState(false)      // 🆕

  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  // 🔎 arama
  const [q, setQ] = useState('')

  // hızlı üye ekleme formu
  const [nm, setNm] = useState('')      // name
  const [em, setEm] = useState('')      // email
  const [ph, setPh] = useState('')      // phone
  const [savingNew, setSavingNew] = useState(false)

  async function load() {
    setLoading(true)
    const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
    if (t.error || !t.data) { setErr(t.error?.message || 'Tenant yok'); setLoading(false); return }
    setTenantId(t.data.id)

    const [s, m, b, tr] = await Promise.all([
      supabase.from('time_slots').select('id,title,start_at,end_at,capacity,trainer_id').eq('id', slotId).single(), // 🆕 trainer_id
      supabase.from('members').select('id, full_name, email, phone').eq('tenant_id', t.data.id).order('full_name'),
      supabase.from('bookings').select('id, member_id, status').eq('time_slot_id', slotId),
      supabase.from('trainers').select('id, full_name').eq('tenant_id', t.data.id).eq('active', true).order('full_name'), // 🆕
    ])

    if (s.error) setErr(s.error.message); else setSlot(s.data as Slot)
    if (m.error) setErr(m.error.message); else setMembers((m.data || []) as Member[])
    if (b.error) setErr(b.error.message); else setBookings((b.data || []) as Booking[])
    if (!tr.error) setTrainers((tr.data || []) as Trainer[]) // 🆕
    setLoading(false)
  }

  useEffect(() => { load() }, [slug, slotId])

  const bookedCount = useMemo(() => bookings.filter(b => b.status === 'BOOKED').length, [bookings])
  const isFull = useMemo(() => (slot ? bookedCount >= slot.capacity : false), [slot, bookedCount])
  const hasAnyBooking = (memberId: string) => bookings.some(b => b.member_id === memberId)
  const nameOf = (id: string) => members.find(m => m.id === id)?.full_name ?? id

  const filteredMembers = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return members
    return members.filter(m => (`${m.full_name} ${m.email ?? ''} ${m.phone ?? ''}`).toLowerCase().includes(term))
  }, [members, q])

  const book = async (memberId: string) => {
    if (!tenantId || isFull || hasAnyBooking(memberId)) return
    setBusyId(memberId)
    const { error } = await supabase.from('bookings').insert({
      tenant_id: tenantId, member_id: memberId, time_slot_id: slotId, status: 'BOOKED',
    })
    setBusyId(null)
    if (error) alert(error.message); else load()
  }

  const setStatus = async (bookingId: string, status: Booking['status']) => {
    setBusyId(bookingId)
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId)
    setBusyId(null)
    if (error) alert(error.message); else load()
  }

  const removeBooking = async (bookingId: string) => {
    if (!confirm('Rezervasyon silinsin mi?')) return
    setBusyId(bookingId)
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
    setBusyId(null)
    if (error) alert(error.message); else load()
  }

  // 🆕 Eğitmen ata/güncelle
  const setTrainer = async (trainerId: string | null) => {
    if (!slot) return
    setUpdatingTrainer(true)
    const { error } = await supabase.from('time_slots').update({ trainer_id: trainerId }).eq('id', slot.id)
    setUpdatingTrainer(false)
    if (error) alert(error.message); else load()
  }

  // ➕ Hızlı üye oluştur + otomatik rezervasyon
  const quickCreateAndBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !nm.trim() || isFull) return
    setSavingNew(true)
    // 1) üyeyi oluştur
    const ins = await supabase.from('members').insert({
      tenant_id: tenantId, full_name: nm.trim(),
      email: em.trim() || null, phone: ph.trim() || null
    }).select('id').single()
    if (ins.error || !ins.data) { alert(ins.error?.message || 'Üye oluşturulamadı'); setSavingNew(false); return }
    const newMemberId = ins.data.id as string
    // 2) rezervasyonu ekle
    const { error } = await supabase.from('bookings').insert({
      tenant_id: tenantId, member_id: newMemberId, time_slot_id: slotId, status: 'BOOKED'
    })
    setSavingNew(false)
    if (error) alert(error.message); else { setNm(''); setEm(''); setPh(''); load() }
  }

  if (loading) return <main className="p-6">Yükleniyor…</main>
  if (err) return <main className="p-6 text-red-600">Hata: {err}</main>
  if (!slot) return <main className="p-6">Slot bulunamadı.</main>

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{slot.title}</h1>
        <span className="text-sm text-gray-600">
          {new Date(slot.start_at).toLocaleString()} – {new Date(slot.end_at).toLocaleTimeString()}
        </span>
        <span className="text-sm px-2 py-0.5 rounded border">
          Kapasite {bookedCount}/{slot.capacity} {isFull && '• DOLU'}
        </span>

        <RoleGate slug={slug} min="MANAGER">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Eğitmen:</span>
            <select
              className="border rounded p-1 text-sm"
              value={slot.trainer_id ?? ''}
              onChange={e => setTrainer(e.target.value || null)}
              disabled={updatingTrainer}
            >
              <option value="">(Seçilmedi)</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>
        </RoleGate>
      </div>

      <section className="space-y-2">
        <h2 className="font-medium">Rezervasyonlar</h2>
        <ul className="divide-y">
          {bookings.map(b => (
            <li key={b.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{nameOf(b.member_id)}</div>
                <div className="text-sm text-gray-600">Durum: {b.status}</div>
              </div>
              <div className="flex gap-2">
                {b.status !== 'BOOKED' && <button disabled={busyId===b.id} onClick={()=>setStatus(b.id,'BOOKED')} className="px-2 py-1 rounded border">Geri Al</button>}
                {b.status !== 'CANCELLED' && <button disabled={busyId===b.id} onClick={()=>setStatus(b.id,'CANCELLED')} className="px-2 py-1 rounded border">İptal</button>}
                {b.status !== 'NO_SHOW' && <button disabled={busyId===b.id} onClick={()=>setStatus(b.id,'NO_SHOW')} className="px-2 py-1 rounded border">No-Show</button>}
                <button disabled={busyId===b.id} onClick={()=>removeBooking(b.id)} className="px-2 py-1 rounded border text-red-600">Sil</button>
              </div>
            </li>
          ))}
          {bookings.length === 0 && <li className="py-3 text-gray-500">Rezervasyon yok.</li>}
        </ul>
      </section>

      {/* 🔎 Üyeyi arayıp ekleme */}
      <section className="space-y-2">
        <h2 className="font-medium">Üye Ekle</h2>
        {isFull && <p className="text-sm text-red-600">Kapasite dolu. Yeni rezervasyon ekleyemezsin.</p>}
        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="block text-sm text-gray-600">Ara</label>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ada, 555..., mail..." className="border rounded p-2" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filteredMembers.map(m => {
            const disabled = isFull || hasAnyBooking(m.id)
            const label = hasAnyBooking(m.id) ? `${m.full_name} (mevcut)` : m.full_name
            return (
              <button key={m.id} onClick={()=>book(m.id)} disabled={disabled || busyId===m.id} className="px-3 py-1 rounded border disabled:opacity-50">
                {busyId===m.id ? 'Ekleniyor…' : label}
              </button>
            )
          })}
          {filteredMembers.length === 0 && <span className="text-gray-500">Eşleşme yok.</span>}
        </div>
      </section>

      {/* ➕ Hızlı üye oluştur + otomatik rezervasyon */}
      <section className="space-y-2">
        <h3 className="font-medium">Listede yok mu? Hızlı oluştur</h3>
        <form onSubmit={quickCreateAndBook} className="grid grid-cols-1 md:grid-cols-4 gap-2 max-w-3xl">
          <input className="border rounded p-2" placeholder="Ad Soyad *" value={nm} onChange={e=>setNm(e.target.value)} required />
          <input className="border rounded p-2" placeholder="E-posta" type="email" value={em} onChange={e=>setEm(e.target.value)} />
          <input className="border rounded p-2" placeholder="Telefon" value={ph} onChange={e=>setPh(e.target.value)} />
          <button disabled={savingNew || isFull} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            {savingNew ? 'Ekleniyor…' : 'Ekle ve Kaydet'}
          </button>
        </form>
      </section>
    </main>
  )
}
