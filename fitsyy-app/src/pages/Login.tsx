import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ACCENT, BORDER, CARD, TEXT2, TEXT3 } from '../theme';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('E-posta veya şifre hatalı.');
    } else {
      navigate('/');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{
            width: 44,
            height: 44,
            background: ACCENT,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 32px ${ACCENT}50`,
          }}>
            <Dumbbell size={22} color="#000" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, lineHeight: 1 }}>FitSyy</div>
            <div style={{ color: TEXT3, fontSize: 12, marginTop: 3 }}>Spor Salonu Yönetimi</div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          padding: 32,
        }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Giriş Yap</h1>
          <p style={{ color: TEXT2, fontSize: 14, margin: '0 0 28px' }}>Hesabınıza giriş yapın</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: TEXT2, fontSize: 13, display: 'block', marginBottom: 8 }}>E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ornek@email.com"
                style={{
                  width: '100%',
                  background: '#080810',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            <div>
              <label style={{ color: TEXT2, fontSize: 13, display: 'block', marginBottom: 8 }}>Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#080810',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            {error && (
              <div style={{
                background: '#ff444420',
                border: '1px solid #ff444440',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#ff8888',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: ACCENT,
                color: '#000',
                border: 'none',
                borderRadius: 12,
                padding: '13px',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
                boxShadow: `0 0 24px ${ACCENT}40`,
              }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
