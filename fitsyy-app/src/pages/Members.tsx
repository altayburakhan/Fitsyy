import { useState, useEffect } from 'react';
import { Search, UserPlus, Award, X, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Member } from '../types';
import { ACCENT, CARD, BORDER, ITEM, TEXT2, TEXT3 } from '../theme';

const planLabel = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
const statusDot = { active: ACCENT, inactive: '#ef4444', frozen: '#f59e0b' };
const statusLabel = { active: 'Aktif', inactive: 'Pasif', frozen: 'Dondurulmuş' };

const avatarGrads = [
  `linear-gradient(135deg, ${ACCENT}, #1ac490)`,
  `linear-gradient(135deg, #1ac490, #0ea58a)`,
  `linear-gradient(135deg, #0d9e78, ${ACCENT})`,
  `linear-gradient(135deg, ${ACCENT}, #0d9e78)`,
  `linear-gradient(135deg, #2dd4a0, #1a8f6a)`,
];


function MemberCard({ m, onSelect }: { m: Member; onSelect: (m: Member) => void }) {
  const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const grad = avatarGrads[m.name.charCodeAt(0) % avatarGrads.length];
  return (
    <div onClick={() => onSelect(m)}
      style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${ACCENT}60`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 13 }}>{initials}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{m.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: statusDot[m.status], display: 'inline-block' }} />
              <span style={{ color: TEXT3, fontSize: 12 }}>{statusLabel[m.status]}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30`, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>{planLabel[m.plan]}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: TEXT3, fontSize: 12 }}><Award size={12} />{m.attendanceThisMonth} gün</span>
          <ChevronRight size={14} style={{ color: TEXT3 }} />
        </div>
      </div>
    </div>
  );
}

function MemberModal({ m, onClose }: { m: Member; onClose: () => void }) {
  const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const grad = avatarGrads[m.name.charCodeAt(0) % avatarGrads.length];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0c0c18', border: `1px solid ${ACCENT}40`, borderRadius: 20, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Üye Detayı</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT3, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 20 }}>{initials}</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{m.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: statusDot[m.status], display: 'inline-block' }} />
                <span style={{ color: TEXT2, fontSize: 13 }}>{statusLabel[m.status]}</span>
                <span style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30`, borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{planLabel[m.plan]}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['E-posta', m.email], ['Telefon', m.phone], ['Yaş', `${m.age} yaşında`], ['Cinsiyet', m.gender === 'male' ? 'Erkek' : 'Kadın'], ['Kayıt', new Date(m.joinDate).toLocaleDateString('tr-TR')], ['Yenileme', new Date(m.renewalDate).toLocaleDateString('tr-TR')]].map(([l, v]) => (
              <div key={l} style={{ background: ITEM, borderRadius: 12, padding: 12 }}>
                <div style={{ color: TEXT3, fontSize: 11, marginBottom: 4 }}>{l}</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: ITEM, borderRadius: 12, padding: 16 }}>
            <div style={{ color: TEXT3, fontSize: 12, marginBottom: 8 }}>Bu Ayki Katılım</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <span style={{ color: '#fff', fontSize: 32, fontWeight: 700 }}>{m.attendanceThisMonth}</span>
              <span style={{ color: TEXT3, fontSize: 14, marginBottom: 4 }}>/ 30 gün</span>
            </div>
            <div style={{ marginTop: 10, background: BORDER, borderRadius: 999, height: 6 }}>
              <div style={{ width: `${Math.min(100, (m.attendanceThisMonth / 30) * 100)}%`, height: 6, borderRadius: 999, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}60` }} />
            </div>
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

function AddMemberModal({ gymId, onClose, onAdded }: { gymId: string; onClose: () => void; onAdded: (m: Member) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: 'basic' as Member['plan'], gender: 'male' as Member['gender'], age: '', renewal_date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { data, error: err } = await supabase.from('members').insert({
      gym_id: gymId,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      plan: form.plan,
      status: 'active',
      gender: form.gender,
      age: form.age ? parseInt(form.age) : null,
      renewal_date: form.renewal_date || null,
    }).select('*').single();

    if (err) { setError('Üye eklenemedi.'); setSaving(false); return; }

    onAdded({
      id: data.id, name: data.name, email: data.email ?? '', phone: data.phone ?? '',
      plan: data.plan, status: data.status, joinDate: data.join_date,
      renewalDate: data.renewal_date ?? '', age: data.age ?? 0,
      gender: data.gender ?? 'male', attendanceThisMonth: 0,
    });
    onClose();
  }

  const inp: React.CSSProperties = { background: '#080810', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '11px 14px', color: '#fff', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { color: TEXT2, fontSize: 12, display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0c0c18', border: `1px solid ${ACCENT}40`, borderRadius: 20, width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Üye Ekle</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT3, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Ad Soyad *</label>
              <input style={inp} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ayşe Kaya" />
            </div>
            <div>
              <label style={lbl}>E-posta</label>
              <input style={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ornek@mail.com" />
            </div>
            <div>
              <label style={lbl}>Telefon</label>
              <input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0532 000 0000" />
            </div>
            <div>
              <label style={lbl}>Paket</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.plan} onChange={e => set('plan', e.target.value)}>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Cinsiyet</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Yaş</label>
              <input style={inp} type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" min="1" max="100" />
            </div>
            <div>
              <label style={lbl}>Yenileme Tarihi</label>
              <input style={inp} type="date" value={form.renewal_date} onChange={e => set('renewal_date', e.target.value)} />
            </div>
          </div>
          {error && <div style={{ background: '#ff444420', border: '1px solid #ff444440', borderRadius: 10, padding: '10px 14px', color: '#ff8888', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: ITEM, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 0', fontSize: 14, cursor: 'pointer' }}>İptal</button>
            <button type="submit" disabled={saving} style={{ flex: 2, background: ACCENT, color: '#000', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: `0 0 16px ${ACCENT}30` }}>
              {saving ? 'Kaydediliyor...' : 'Üye Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fStatus, setFStatus] = useState('all');
  const [fPlan, setFPlan] = useState('all');
  const [sel, setSel] = useState<Member | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!profile?.gym_id) return;
    supabase
      .from('members')
      .select('*')
      .eq('gym_id', profile.gym_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMembers((data ?? []).map(r => ({
          id: r.id,
          name: r.name,
          email: r.email ?? '',
          phone: r.phone ?? '',
          plan: r.plan,
          status: r.status,
          joinDate: r.join_date,
          renewalDate: r.renewal_date ?? '',
          age: r.age ?? 0,
          gender: r.gender ?? 'male',
          attendanceThisMonth: r.attendance_this_month ?? 0,
        })));
        setLoading(false);
      });
  }, [profile?.gym_id]);

  const filtered = members.filter(m => {
    const ms = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    return ms && (fStatus === 'all' || m.status === fStatus) && (fPlan === 'all' || m.plan === fPlan);
  });

  const inputStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, color: '#fff', borderRadius: 12, padding: '10px 16px 10px 40px', fontSize: 14, outline: 'none', width: '100%' };
  const selectStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, color: TEXT2, borderRadius: 12, padding: '10px 16px', fontSize: 13, outline: 'none', cursor: 'pointer' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: TEXT3, fontSize: 14 }}>
      Yükleniyor...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Üye Yönetimi</h2>
          <p style={{ color: TEXT2, fontSize: 14, marginTop: 4 }}>{members.length} toplam · {members.filter(m => m.status === 'active').length} aktif</p>
        </div>
        <button onClick={() => setAddOpen(true)} style={{ background: ACCENT, color: '#000', border: 'none', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 0 24px ${ACCENT}40` }}>
          <UserPlus size={16} /> Üye Ekle
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: TEXT3 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Üye ara..." style={inputStyle} />
        </div>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={selectStyle}>
          <option value="all">Tüm Durum</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
          <option value="frozen">Dondurulmuş</option>
        </select>
        <select value={fPlan} onChange={e => setFPlan(e.target.value)} style={selectStyle}>
          <option value="all">Tüm Paketler</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
        {[
          { label: 'Aktif', count: members.filter(m => m.status === 'active').length, color: ACCENT },
          { label: 'Pasif', count: members.filter(m => m.status === 'inactive').length, color: '#ef4444' },
          { label: 'Dondurulmuş', count: members.filter(m => m.status === 'frozen').length, color: '#f59e0b' },
          { label: 'Premium', count: members.filter(m => m.plan === 'premium').length, color: ACCENT },
          { label: 'Standard', count: members.filter(m => m.plan === 'standard').length, color: '#1ac490' },
          { label: 'Basic', count: members.filter(m => m.plan === 'basic').length, color: '#0d9e78' },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 90, flexShrink: 0 }}>
            <div style={{ color, fontSize: 22, fontWeight: 700 }}>{count}</div>
            <div style={{ color: TEXT3, fontSize: 12, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(m => <MemberCard key={m.id} m={m} onSelect={setSel} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: TEXT3 }}>
          <Search size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
          <p style={{ fontSize: 16 }}>Üye bulunamadı</p>
        </div>
      )}

      {sel && <MemberModal m={sel} onClose={() => setSel(null)} />}
      {addOpen && profile?.gym_id && (
        <AddMemberModal
          gymId={profile.gym_id}
          onClose={() => setAddOpen(false)}
          onAdded={m => setMembers(prev => [m, ...prev])}
        />
      )}
    </div>
  );
}
