import { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Calendar, DollarSign, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Staff as StaffType } from '../types';
import { ACCENT, CARD, BORDER, ITEM, TEXT2, TEXT3 } from '../theme';

const roleLabel: Record<StaffType['role'], string> = { manager: 'Yönetici', trainer: 'Antrenör', receptionist: 'Resepsiyon', cleaner: 'Temizlik' };

const avatarGrads = [
  `linear-gradient(135deg, ${ACCENT}, #1ac490)`,
  `linear-gradient(135deg, #1ac490, #0ea58a)`,
  `linear-gradient(135deg, #0d9e78, ${ACCENT})`,
  `linear-gradient(135deg, ${ACCENT}, #0d9e78)`,
  `linear-gradient(135deg, #2dd4a0, #1a8f6a)`,
  `linear-gradient(135deg, #0ea58a, ${ACCENT})`,
];

function StaffModal({ m, onClose }: { m: StaffType; onClose: () => void }) {
  const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const grad = avatarGrads[m.name.charCodeAt(0) % avatarGrads.length];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0c0c18', border: `1px solid ${ACCENT}40`, borderRadius: 20, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Çalışan Detayı</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT3, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 20 }}>{initials}</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{m.name}</div>
              <span style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30`, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>{roleLabel[m.role]}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { Icon: Mail, l: 'E-posta', v: m.email || '-' },
              { Icon: Phone, l: 'Telefon', v: m.phone || '-' },
              { Icon: DollarSign, l: 'Maaş', v: m.salary ? `₺${m.salary.toLocaleString('tr-TR')}` : '-' },
              { Icon: Calendar, l: 'İşe Giriş', v: m.joinDate ? new Date(m.joinDate).toLocaleDateString('tr-TR') : '-' },
            ].map(({ Icon, l, v }) => (
              <div key={l} style={{ background: ITEM, borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon size={11} style={{ color: TEXT3 }} />
                  <span style={{ color: TEXT3, fontSize: 11 }}>{l}</span>
                </div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, background: ACCENT, color: '#000', border: 'none', borderRadius: 12, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 0 16px ${ACCENT}30` }}>Düzenle</button>
            <button style={{ flex: 1, background: ITEM, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '11px 0', fontSize: 14, cursor: 'pointer' }}>Mesaj Gönder</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddStaffModal({ gymId, onClose, onAdded }: { gymId: string; onClose: () => void; onAdded: (s: StaffType) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'trainer' as StaffType['role'], salary: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { data, error: err } = await supabase.from('staff').insert({
      gym_id: gymId,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      role: form.role,
      salary: form.salary ? parseFloat(form.salary) : null,
      status: 'active',
    }).select('*').single();

    if (err) { setError('Çalışan eklenemedi.'); setSaving(false); return; }

    onAdded({
      id: data.id, name: data.name, email: data.email ?? '',
      phone: data.phone ?? '', role: data.role,
      salary: data.salary ?? 0, joinDate: data.join_date,
      status: data.status, schedule: [],
    });
    onClose();
  }

  const inp: React.CSSProperties = { background: '#080810', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '11px 14px', color: '#fff', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { color: TEXT2, fontSize: 12, display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0c0c18', border: `1px solid ${ACCENT}40`, borderRadius: 20, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Çalışan Ekle</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT3, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Ad Soyad *</label>
              <input style={inp} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ahmet Yılmaz" />
            </div>
            <div>
              <label style={lbl}>Rol</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="trainer">Antrenör</option>
                <option value="manager">Yönetici</option>
                <option value="receptionist">Resepsiyon</option>
                <option value="cleaner">Temizlik</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Maaş (₺)</label>
              <input style={inp} type="number" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="15000" />
            </div>
            <div>
              <label style={lbl}>E-posta</label>
              <input style={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ornek@mail.com" />
            </div>
            <div>
              <label style={lbl}>Telefon</label>
              <input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0532 000 0000" />
            </div>
          </div>
          {error && <div style={{ background: '#ff444420', border: '1px solid #ff444440', borderRadius: 10, padding: '10px 14px', color: '#ff8888', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: ITEM, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 0', fontSize: 14, cursor: 'pointer' }}>İptal</button>
            <button type="submit" disabled={saving} style={{ flex: 2, background: ACCENT, color: '#000', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: `0 0 16px ${ACCENT}30` }}>
              {saving ? 'Kaydediliyor...' : 'Çalışan Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Staff() {
  const { profile } = useAuth();
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<StaffType | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [fRole, setFRole] = useState('all');

  useEffect(() => {
    if (!profile?.gym_id) return;
    supabase
      .from('staff')
      .select('*')
      .eq('gym_id', profile.gym_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setStaff((data ?? []).map(r => ({
          id: r.id, name: r.name, email: r.email ?? '',
          phone: r.phone ?? '', role: r.role,
          salary: r.salary ?? 0, joinDate: r.join_date,
          status: r.status, schedule: [],
        })));
        setLoading(false);
      });
  }, [profile?.gym_id]);

  const filtered = fRole === 'all' ? staff : staff.filter(s => s.role === fRole);
  const totalSalary = staff.reduce((s, m) => s + m.salary, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: TEXT3, fontSize: 14 }}>
      Yükleniyor...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Çalışan Yönetimi</h2>
          <p style={{ color: TEXT2, fontSize: 14, marginTop: 4 }}>{staff.length} çalışan · ₺{totalSalary.toLocaleString('tr-TR')} maaş</p>
        </div>
        <button onClick={() => setAddOpen(true)} style={{ background: ACCENT, color: '#000', border: 'none', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 0 24px ${ACCENT}40` }}>
          <UserPlus size={16} /> Çalışan Ekle
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['all', 'Tümü'], ['manager', 'Yönetici'], ['trainer', 'Antrenör'], ['receptionist', 'Resepsiyon'], ['cleaner', 'Temizlik']].map(([v, l]) => (
          <button key={v} onClick={() => setFRole(v)}
            style={{ background: fRole === v ? ACCENT : CARD, color: fRole === v ? '#000' : TEXT2, border: `1px solid ${fRole === v ? ACCENT : BORDER}`, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: fRole === v ? 700 : 400, cursor: 'pointer' }}>
            {l} <span style={{ opacity: .6, fontSize: 12 }}>{v === 'all' ? staff.length : staff.filter(s => s.role === v).length}</span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(m => {
            const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
            const grad = avatarGrads[m.name.charCodeAt(0) % avatarGrads.length];
            return (
              <div key={m.id} onClick={() => setSel(m)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${ACCENT}60`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 18 }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                    <span style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30`, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>{roleLabel[m.role]}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: TEXT3, fontSize: 12 }}>{m.email || '-'}</span>
                  <span style={{ color: ACCENT, fontSize: 12, fontWeight: 600 }}>{m.salary ? `₺${m.salary.toLocaleString('tr-TR')}` : '-'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: TEXT3 }}>
          <UserPlus size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
          <p style={{ fontSize: 16 }}>Henüz çalışan yok</p>
        </div>
      )}

      {sel && <StaffModal m={sel} onClose={() => setSel(null)} />}
      {addOpen && profile?.gym_id && (
        <AddStaffModal
          gymId={profile.gym_id}
          onClose={() => setAddOpen(false)}
          onAdded={s => setStaff(prev => [s, ...prev])}
        />
      )}
    </div>
  );
}
