import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { transactions, monthlyRevenue } from '../data/mockData';
import { ACCENT, CARD, BORDER, ITEM, TEXT2, TEXT3 } from '../theme';

const catIcons: Record<string, string> = { 'Üyelik': '👥', 'Kurs': '🎯', 'Market': '🛒', 'Kira': '🏠', 'Maaş': '💼', 'Ekipman': '🏋️', 'Elektrik/Su': '⚡', 'Temizlik': '🧹', 'Pazarlama': '📣' };

const expDist = [
  { category: 'Maaşlar',   amount: 104000, color: ACCENT },
  { category: 'Ekipman',   amount: 25000,  color: '#1ac490' },
  { category: 'Kira',      amount: 15000,  color: '#0d9e78' },
  { category: 'Faturalar', amount: 3500,   color: '#0a6e54' },
  { category: 'Pazarlama', amount: 3000,   color: '#074d3b' },
  { category: 'Diğer',     amount: 4200,   color: '#2a2a3a' },
];

export default function Finance() {
  const [tab, setTab] = useState<'all' | 'income' | 'expense'>('all');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;
  const filtered = tab === 'all' ? transactions : transactions.filter(t => t.type === tab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Finans & Raporlar</h2>
          <p style={{ color: TEXT2, fontSize: 14, marginTop: 4 }}>Nisan 2026 finansal özeti</p>
        </div>
        <button style={{ background: ACCENT, color: '#000', border: 'none', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 0 24px ${ACCENT}40` }}>
          <PlusCircle size={16} /> İşlem Ekle
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: <ArrowUpRight size={18} style={{ color: ACCENT }} />, iconBg: `${ACCENT}15`, badge: '+7.4%', badgeColor: ACCENT, label: 'Toplam Gelir', value: `₺${totalIncome.toLocaleString('tr-TR')}`, vColor: ACCENT, border: `${ACCENT}30` },
          { icon: <ArrowDownRight size={18} color="#f87171" />, iconBg: '#ef444415', badge: '+3.1%', badgeColor: '#f87171', label: 'Toplam Gider', value: `₺${totalExpense.toLocaleString('tr-TR')}`, vColor: '#fff', border: BORDER },
          { icon: <DollarSign size={18} style={{ color: net >= 0 ? ACCENT : '#f87171' }} />, iconBg: net >= 0 ? `${ACCENT}15` : '#ef444415', badge: 'Net', badgeColor: net >= 0 ? ACCENT : '#f87171', label: 'Net Kazanç', value: `₺${net.toLocaleString('tr-TR')}`, vColor: net >= 0 ? ACCENT : '#f87171', border: net >= 0 ? `${ACCENT}30` : '#ef444430' },
        ].map((c, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <span style={{ background: `${c.badgeColor}15`, color: c.badgeColor, fontSize: 12, padding: '4px 8px', borderRadius: 999 }}>{c.badge}</span>
            </div>
            <div style={{ color: TEXT2, fontSize: 13 }}>{c.label}</div>
            <div style={{ color: c.vColor, fontSize: 26, fontWeight: 700, marginTop: 4 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Aylık Karşılaştırma</div>
          <div style={{ color: TEXT3, fontSize: 13, marginBottom: 20 }}>Gelir & Gider Analizi</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16162a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: TEXT3, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: TEXT3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₺${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: '#f1f5f9' }} formatter={v => `₺${Number(v).toLocaleString('tr-TR')}`} />
              <Legend wrapperStyle={{ paddingTop: 16 }} formatter={v => <span style={{ color: TEXT2, fontSize: 12 }}>{v === 'gelir' ? 'Gelir' : 'Gider'}</span>} />
              <Bar dataKey="gelir" fill={ACCENT} radius={[6, 6, 0, 0]} name="gelir" />
              <Bar dataKey="gider" fill="#1a4a3a" radius={[6, 6, 0, 0]} name="gider" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Gider Dağılımı</div>
          <div style={{ color: TEXT3, fontSize: 13, marginBottom: 16 }}>Kategori bazlı</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={expDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="amount">
                {expDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: '#f1f5f9' }} formatter={v => `₺${Number(v).toLocaleString('tr-TR')}`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {expDist.map(item => (
              <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: TEXT2, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: item.color, display: 'inline-block' }} />
                  {item.category}
                </span>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>₺{(item.amount / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>İşlem Geçmişi</div>
          <div style={{ background: ITEM, borderRadius: 10, padding: 4, display: 'flex', gap: 2 }}>
            {[['all', 'Tümü'], ['income', 'Gelir'], ['expense', 'Gider']].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v as typeof tab)}
                style={{ background: tab === v ? BORDER : 'transparent', color: tab === v ? '#fff' : TEXT3, border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: tab === v ? 600 : 400 }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
          {filtered.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: ITEM, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: t.type === 'income' ? `${ACCENT}15` : '#1a1a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {catIcons[t.category] ?? '💰'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span style={{ color: TEXT3, fontSize: 12 }}>{new Date(t.date).toLocaleDateString('tr-TR')}</span>
                  <span style={{ color: BORDER }}>·</span>
                  <span style={{ color: TEXT3, fontSize: 12 }}>{t.category}</span>
                  {t.paymentMethod && <><span style={{ color: BORDER }}>·</span><span style={{ color: TEXT3, fontSize: 12 }}>{t.paymentMethod}</span></>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ color: t.type === 'income' ? ACCENT : '#f87171', fontSize: 14, fontWeight: 700 }}>
                  {t.type === 'income' ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                </span>
                {t.type === 'income' ? <TrendingUp size={14} style={{ color: ACCENT }} /> : <TrendingDown size={14} color="#f87171" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
