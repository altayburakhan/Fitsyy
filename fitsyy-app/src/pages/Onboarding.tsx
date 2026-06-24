import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, Heart, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ACCENT, BORDER, CARD, TEXT2, TEXT3, ITEM, BORDER2 } from '../theme';

type GymType = 'fitness' | 'pilates' | 'sports';

const GYM_TYPES: { value: GymType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'fitness',
    label: 'Fitness Merkezi',
    desc: 'Ekipman, üyelik planları, antrenman takibi',
    icon: <Dumbbell size={22} />,
  },
  {
    value: 'pilates',
    label: 'Pilates Stüdyosu',
    desc: 'Ders takvimi, doluluk oranı, eğitmen yönetimi',
    icon: <Heart size={22} />,
  },
  {
    value: 'sports',
    label: 'Spor Salonu',
    desc: 'Kort/alan rezervasyonu, takım ve etkinlik yönetimi',
    icon: <Activity size={22} />,
  },
];

export default function Onboarding() {
  const { refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }
  const [gymName, setGymName] = useState('');
  const [gymType, setGymType] = useState<GymType>('fitness');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gymName.trim()) return;
    setError('');
    setLoading(true);

    const slug = gymName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { error: rpcError } = await supabase.rpc('setup_gym', {
      gym_name: gymName.trim(),
      gym_slug: `${slug}-${Date.now()}`,
      gym_type: gymType,
    });

    if (rpcError) {
      setError('Salon oluşturulamadı. Lütfen tekrar dene.');
      setLoading(false);
      return;
    }

    await refreshProfile();
    navigate('/');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo + Çıkış */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, background: ACCENT, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 32px ${ACCENT}50`,
            }}>
              <Dumbbell size={22} color="#000" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, lineHeight: 1 }}>FitSyy</div>
              <div style={{ color: TEXT3, fontSize: 12, marginTop: 3 }}>Spor Salonu Yönetimi</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: '8px 14px', color: TEXT2,
              fontSize: 13, cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff444460'; (e.currentTarget as HTMLButtonElement).style.color = '#ff8888'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = TEXT2; }}
          >
            <LogOut size={14} />
            Çıkış Yap
          </button>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32 }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Salonunu Kur</h1>
          <p style={{ color: TEXT2, fontSize: 14, margin: '0 0 28px' }}>Birkaç adımda salonunu oluştur, hemen kullanmaya başla.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Salon adı */}
            <div>
              <label style={{ color: TEXT2, fontSize: 13, display: 'block', marginBottom: 8 }}>Salon Adı</label>
              <input
                type="text"
                value={gymName}
                onChange={e => setGymName(e.target.value)}
                required
                placeholder="Örn: Atlas Fitness"
                style={{
                  width: '100%', background: '#080810', border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            {/* Salon tipi */}
            <div>
              <label style={{ color: TEXT2, fontSize: 13, display: 'block', marginBottom: 12 }}>Salon Tipi</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {GYM_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setGymType(t.value)}
                    style={{
                      background: gymType === t.value ? `${ACCENT}15` : ITEM,
                      border: `1px solid ${gymType === t.value ? ACCENT : BORDER2}`,
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ color: gymType === t.value ? ACCENT : TEXT2 }}>{t.icon}</div>
                    <div>
                      <div style={{ color: gymType === t.value ? '#fff' : TEXT2, fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                      <div style={{ color: TEXT3, fontSize: 12, marginTop: 2 }}>{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                background: '#ff444420', border: '1px solid #ff444440',
                borderRadius: 10, padding: '10px 14px', color: '#ff8888', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !gymName.trim()}
              style={{
                background: ACCENT, color: '#000', border: 'none', borderRadius: 12,
                padding: '13px', fontSize: 14, fontWeight: 700,
                cursor: loading || !gymName.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !gymName.trim() ? 0.6 : 1,
                marginTop: 4, boxShadow: `0 0 24px ${ACCENT}40`,
              }}
            >
              {loading ? 'Oluşturuluyor...' : 'Salonu Oluştur'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
