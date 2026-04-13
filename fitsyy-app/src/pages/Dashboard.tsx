import { Users, TrendingUp, Calendar, UserCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { members, classEvents, monthlyRevenue } from '../data/mockData';
import { ACCENT, CARD, BORDER, ITEM, TEXT2, TEXT3 } from '../theme';

const activeMembers = members.filter(m => m.status === 'active').length;
const todayClasses = classEvents.filter(e => e.date === '2026-04-14');

const recentActivities = [
  { id: 1, text: 'Burak Güler yeni üye oldu', time: '2 saat önce', icon: CheckCircle2, color: ACCENT },
  { id: 2, text: 'Sabah Yoga doldu (15/15)', time: '3 saat önce', icon: AlertCircle, color: '#f59e0b' },
  { id: 3, text: 'Ali Yılmaz üyeliğini dondurdu', time: '5 saat önce', icon: Clock, color: '#fb923c' },
  { id: 4, text: 'Selin Özkan ödeme yaptı - ₺1.500', time: '6 saat önce', icon: CheckCircle2, color: ACCENT },
  { id: 5, text: 'HIIT Cardio dersi eklendi', time: '1 gün önce', icon: CheckCircle2, color: ACCENT },
];

const memberDist = [
  { name: 'Premium', value: 42, color: ACCENT },
  { name: 'Standard', value: 35, color: '#1a8f6a' },
  { name: 'Basic', value: 23, color: '#0d4535' },
];

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Genel Bakış</h2>
          <p style={{ color: TEXT2, marginTop: 4, fontSize: 14 }}>Pazar, 13 Nisan 2026</p>
        </div>
        <button style={{ background: ACCENT, color: '#000', padding: '10px 18px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 0 24px ${ACCENT}40` }}>
          + Yeni Üye Ekle
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard title="Toplam Üye" value={members.length} subtitle={`${activeMembers} aktif üye`} icon={<Users size={20} />} trend={{ value: 8, positive: true }} />
        <StatCard title="Aylık Gelir" value="₺102.000" subtitle="Hedefin %87'si" icon={<TrendingUp size={20} />} trend={{ value: 7.4, positive: true }} />
        <StatCard title="Bugünkü Dersler" value={todayClasses.length} subtitle={`${todayClasses.reduce((a, b) => a + b.enrolled, 0)} katılımcı`} icon={<Calendar size={20} />} />
        <StatCard title="Aktif Çalışan" value={6} subtitle="3 antrenör, 1 resepsiyon" icon={<UserCheck size={20} />} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Area chart */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Gelir / Gider Analizi</div>
              <div style={{ color: TEXT3, fontSize: 13, marginTop: 2 }}>Son 7 ay</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: TEXT2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: ACCENT, display: 'inline-block' }} />Gelir</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: '#2a4a3a', display: 'inline-block' }} />Gider</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a4a3a" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#2a4a3a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#16162a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: TEXT3, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: TEXT3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₺${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: '#f1f5f9' }} formatter={v => `₺${Number(v).toLocaleString('tr-TR')}`} />
              <Area type="monotone" dataKey="gelir" stroke={ACCENT} strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="gider" stroke="#2a6a50" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Üyelik Dağılımı</div>
          <div style={{ color: TEXT3, fontSize: 13, marginTop: 2, marginBottom: 16 }}>Paket bazlı</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={memberDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {memberDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: '#f1f5f9' }} formatter={v => `%${Number(v)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {memberDist.map(item => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: TEXT2 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: item.color, display: 'inline-block' }} />
                  {item.name}
                </span>
                <span style={{ color: '#fff', fontWeight: 500 }}>%{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Today classes */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Bugünkü Dersler</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayClasses.map(cls => (
              <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: ITEM, borderRadius: 12, padding: 12 }}>
                <div style={{ width: 3, height: 44, borderRadius: 99, background: ACCENT, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{cls.title}</div>
                  <div style={{ color: TEXT3, fontSize: 12, marginTop: 2 }}>{cls.trainer} · {cls.room}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: TEXT2, fontSize: 13, fontWeight: 500 }}>{cls.startTime}–{cls.endTime}</div>
                  <div style={{ fontSize: 12, marginTop: 2, color: cls.enrolled >= cls.capacity ? '#f87171' : TEXT3 }}>{cls.enrolled}/{cls.capacity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Son Aktiviteler</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentActivities.map(a => {
              const Icon = a.icon;
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: ITEM, borderRadius: 12, padding: 12 }}>
                  <Icon size={16} style={{ color: a.color, marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: '#ccc', fontSize: 13 }}>{a.text}</div>
                    <div style={{ color: TEXT3, fontSize: 12, marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
