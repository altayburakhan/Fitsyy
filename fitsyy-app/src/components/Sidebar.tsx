import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, UserCheck,
  TrendingUp, Dumbbell, Settings, LogOut, Bell,
} from 'lucide-react';
import { ACCENT, BORDER, TEXT2, TEXT3 } from '../theme';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Üyeler' },
  { to: '/calendar', icon: Calendar, label: 'Takvim' },
  { to: '/staff', icon: UserCheck, label: 'Çalışanlar' },
  { to: '/finance', icon: TrendingUp, label: 'Finans' },
];

export default function Sidebar() {
  return (
    <aside style={{ width: 256, background: '#050510', borderRight: `1px solid ${BORDER}`, position: 'fixed', top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column', zIndex: 50 }}>

      {/* Logo */}
      <div style={{ padding: '24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, background: ACCENT, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${ACCENT}50` }}>
          <Dumbbell size={20} color="#000" />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>FitSyy</div>
          <div style={{ color: TEXT3, fontSize: 11, marginTop: 3 }}>Spor Salonu Yönetimi</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px', borderRadius: 12, marginBottom: 4,
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              textDecoration: 'none', transition: 'all .15s',
              background: isActive ? `${ACCENT}18` : 'transparent',
              color: isActive ? ACCENT : TEXT2,
              borderLeft: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom buttons */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '12px' }}>
        {[
          { icon: Bell, label: 'Bildirimler', badge: '3' },
          { icon: Settings, label: 'Ayarlar' },
        ].map(({ icon: Icon, label, badge }) => (
          <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 16px', borderRadius: 12, border: 'none', background: 'transparent', color: TEXT2, fontSize: 14, cursor: 'pointer', marginBottom: 2 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = TEXT2)}>
            <Icon size={18} />
            {label}
            {badge && <span style={{ marginLeft: 'auto', background: ACCENT, color: '#000', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{badge}</span>}
          </button>
        ))}
        <button style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 16px', borderRadius: 12, border: 'none', background: 'transparent', color: '#ef4444', fontSize: 14, cursor: 'pointer' }}>
          <LogOut size={18} /> Çıkış Yap
        </button>
      </div>

      {/* User */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: `linear-gradient(135deg, ${ACCENT}, #1ac490)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 13 }}>HA</div>
        <div>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Hakan Akın</div>
          <div style={{ color: TEXT3, fontSize: 11 }}>Yönetici</div>
        </div>
      </div>
    </aside>
  );
}
