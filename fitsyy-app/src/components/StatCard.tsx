import type { ReactNode } from 'react';
import { ACCENT, CARD, BORDER, TEXT2, TEXT3 } from '../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ACCENT}18`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {trend && (
          <span style={{ background: trend.positive ? `${ACCENT}15` : '#ef444415', color: trend.positive ? ACCENT : '#f87171', fontSize: 12, fontWeight: 500, padding: '4px 8px', borderRadius: 999 }}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div style={{ color: TEXT2, fontSize: 13, marginBottom: 4 }}>{title}</div>
      <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {subtitle && <div style={{ color: TEXT3, fontSize: 12, marginTop: 6 }}>{subtitle}</div>}
    </div>
  );
}
