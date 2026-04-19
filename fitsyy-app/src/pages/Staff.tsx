import { useState } from 'react';
import { UserPlus, Mail, Phone, Calendar, DollarSign, Clock, X } from 'lucide-react';
import { staff } from '../data/mockData';
import type { Staff as StaffType } from '../types';
import { ACCENT, CARD, BORDER, ITEM, TEXT2, TEXT3 } from '../theme';

const roleLabel: Record<StaffType['role'], string> = { manager: 'Yönetici', trainer: 'Antrenör', receptionist: 'Resepsiyon', cleaner: 'Temizlik' };
const dayLabel: Record<string, string> = { Mon: 'Pzt', Tue: 'Sal', Wed: 'Çar', Thu: 'Per', Fri: 'Cum', Sat: 'Cmt', Sun: 'Paz' };
const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
              { Icon: Mail, l: 'E-posta', v: m.email },
              { Icon: Phone, l: 'Telefon', v: m.phone },
              { Icon: DollarSign, l: 'Maaş', v: `₺${m.salary.toLocaleString('tr-TR')}` },
              { Icon: Calendar, l: 'İşe Giriş', v: new Date(m.joinDate).toLocaleDateString('tr-TR') },
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
          <div style={{ background: ITEM, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: TEXT3, fontSize: 12, marginBottom: 12 }}><Clock size={11} /> Çalışma Günleri</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {allDays.map(d => (
                <span key={d} style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: m.schedule.includes(d) ? 700 : 400, background: m.schedule.includes(d) ? ACCENT : BORDER, color: m.schedule.includes(d) ? '#000' : TEXT3 }}>{dayLabel[d]}</span>
              ))}
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

export default function Staff() {
  const [sel, setSel] = useState<StaffType | null>(null);
  const [fRole, setFRole] = useState('all');
  const filtered = fRole === 'all' ? staff : staff.filter(s => s.role === fRole);
  const totalSalary = staff.reduce((s, m) => s + m.salary, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Çalışan Yönetimi</h2>
          <p style={{ color: TEXT2, fontSize: 14, marginTop: 4 }}>{staff.length} çalışan · ₺{totalSalary.toLocaleString('tr-TR')} maaş</p>
        </div>
        <button style={{ background: ACCENT, color: '#000', border: 'none', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 0 24px ${ACCENT}40` }}>
          <UserPlus size={16} /> Çalışan Ekle
        </button>
      </div>

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['all', 'Tümü'], ['manager', 'Yönetici'], ['trainer', 'Antrenör'], ['receptionist', 'Resepsiyon'], ['cleaner', 'Temizlik']].map(([v, l]) => (
          <button key={v} onClick={() => setFRole(v)}
            style={{ background: fRole === v ? ACCENT : CARD, color: fRole === v ? '#000' : TEXT2, border: `1px solid ${fRole === v ? ACCENT : BORDER}`, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: fRole === v ? 700 : 400, cursor: 'pointer' }}>
            {l} <span style={{ opacity: .6, fontSize: 12 }}>{v === 'all' ? staff.length : staff.filter(s => s.role === v).length}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
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
              <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                {allDays.map(d => <div key={d} style={{ flex: 1, height: 5, borderRadius: 99, background: m.schedule.includes(d) ? ACCENT : BORDER }} />)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: TEXT3, fontSize: 11 }}>Pzt</span>
                <span style={{ color: TEXT3, fontSize: 11 }}>Paz</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Haftalık Program Özeti</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: TEXT3, fontSize: 12, fontWeight: 500, paddingBottom: 12, width: 160 }}>Çalışan</th>
                {allDays.map(d => <th key={d} style={{ textAlign: 'center', color: TEXT3, fontSize: 12, fontWeight: 500, paddingBottom: 12 }}>{dayLabel[d]}</th>)}
              </tr>
            </thead>
            <tbody>
              {staff.map(m => (
                <tr key={m.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: avatarGrads[m.name.charCodeAt(0) % avatarGrads.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 11 }}>
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{m.name.split(' ')[0]}</div>
                        <div style={{ color: TEXT3, fontSize: 11 }}>{roleLabel[m.role]}</div>
                      </div>
                    </div>
                  </td>
                  {allDays.map(d => (
                    <td key={d} style={{ textAlign: 'center', padding: '12px 0' }}>
                      {m.schedule.includes(d)
                        ? <div style={{ width: 24, height: 24, borderRadius: 6, background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 999, background: ACCENT }} />
                          </div>
                        : <div style={{ width: 24, height: 24, margin: '0 auto' }} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && <StaffModal m={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
