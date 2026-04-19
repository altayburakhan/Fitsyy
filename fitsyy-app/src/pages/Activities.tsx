import { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, UserPlus, CreditCard, Snowflake, Dumbbell, Filter } from 'lucide-react';
import { ACCENT, CARD, BORDER, TEXT2, TEXT3 } from '../theme';

type ActivityType = 'all' | 'join' | 'payment' | 'freeze' | 'class' | 'staff';

const allActivities = [
  { id: 1,  type: 'join',    icon: UserPlus,     color: ACCENT,    title: 'Burak Güler yeni üye oldu',              detail: 'Basic paket · Kayıt tamamlandı',               time: '2 saat önce',   date: '13 Nisan 2026' },
  { id: 2,  type: 'class',   icon: AlertCircle,  color: '#f59e0b', title: 'Sabah Yoga dersi doldu',                  detail: '15/15 katılımcı · Elif Korkmaz',               time: '3 saat önce',   date: '13 Nisan 2026' },
  { id: 3,  type: 'freeze',  icon: Snowflake,    color: '#38bdf8', title: 'Ali Yılmaz üyeliğini dondurdu',           detail: 'Premium paket · 30 gün donduruldu',            time: '5 saat önce',   date: '13 Nisan 2026' },
  { id: 4,  type: 'payment', icon: CreditCard,   color: ACCENT,    title: 'Selin Özkan ödeme yaptı',                 detail: '₺1.500 · Premium paket yenileme',              time: '6 saat önce',   date: '13 Nisan 2026' },
  { id: 5,  type: 'class',   icon: Dumbbell,     color: ACCENT,    title: 'HIIT Cardio dersi eklendi',               detail: 'Serkan Doğan · Ana Salon · 10:00',             time: '1 gün önce',    date: '12 Nisan 2026' },
  { id: 6,  type: 'join',    icon: UserPlus,     color: ACCENT,    title: 'Nur Aydın yeni üye oldu',                 detail: 'Premium paket · Kayıt tamamlandı',             time: '1 gün önce',    date: '12 Nisan 2026' },
  { id: 7,  type: 'payment', icon: CreditCard,   color: ACCENT,    title: 'Fatma Çelik ödeme yaptı',                 detail: '₺900 · Standard paket yenileme',               time: '1 gün önce',    date: '12 Nisan 2026' },
  { id: 8,  type: 'staff',   icon: CheckCircle2, color: '#a3e635', title: 'Murat Bal vardiyaya başladı',             detail: 'Antrenör · 09:00 girişi',                      time: '2 gün önce',    date: '11 Nisan 2026' },
  { id: 9,  type: 'class',   icon: AlertCircle,  color: '#f59e0b', title: 'Spinning dersi iptal edildi',             detail: 'Serkan Doğan hastalık izni · 11:00',           time: '2 gün önce',    date: '11 Nisan 2026' },
  { id: 10, type: 'payment', icon: CreditCard,   color: ACCENT,    title: 'Can Koçak ödeme yaptı',                   detail: '₺900 · Standard paket yenileme',               time: '2 gün önce',    date: '11 Nisan 2026' },
  { id: 11, type: 'join',    icon: UserPlus,     color: ACCENT,    title: 'Emre Şahin üyeliğini yeniledi',           detail: 'Basic → Standard paket geçişi',                time: '3 gün önce',    date: '10 Nisan 2026' },
  { id: 12, type: 'freeze',  icon: Snowflake,    color: '#38bdf8', title: 'Zeynep Arslan üyeliğini dondurdu',        detail: 'Basic paket · 15 gün donduruldu',              time: '3 gün önce',    date: '10 Nisan 2026' },
  { id: 13, type: 'staff',   icon: CheckCircle2, color: '#a3e635', title: 'Elif Korkmaz yeni ders programı ekledi',  detail: 'Akşam Yoga · Stüdyo A · 19:00',               time: '4 gün önce',    date: '9 Nisan 2026'  },
  { id: 14, type: 'payment', icon: CreditCard,   color: ACCENT,    title: 'Toplu üyelik ödemesi alındı',             detail: '₺32.000 · 28 üye',                             time: '4 gün önce',    date: '9 Nisan 2026'  },
  { id: 15, type: 'class',   icon: Dumbbell,     color: ACCENT,    title: 'Zumba dersi kapasitesi artırıldı',        detail: '20 → 25 kişi · Elif Korkmaz',                 time: '5 gün önce',    date: '8 Nisan 2026'  },
];

const filterLabels: Record<ActivityType, string> = {
  all: 'Tümü', join: 'Üyelik', payment: 'Ödeme', freeze: 'Dondurma', class: 'Ders', staff: 'Personel',
};

const filterColors: Record<ActivityType, string> = {
  all: ACCENT, join: ACCENT, payment: ACCENT, freeze: '#38bdf8', class: '#f59e0b', staff: '#a3e635',
};

export default function Activities() {
  const [activeFilter, setActiveFilter] = useState<ActivityType>('all');

  const filtered = activeFilter === 'all' ? allActivities : allActivities.filter(a => a.type === activeFilter);

  // Tarihe göre grupla
  const grouped = filtered.reduce<Record<string, typeof allActivities>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const counts = {
    all: allActivities.length,
    join: allActivities.filter(a => a.type === 'join').length,
    payment: allActivities.filter(a => a.type === 'payment').length,
    freeze: allActivities.filter(a => a.type === 'freeze').length,
    class: allActivities.filter(a => a.type === 'class').length,
    staff: allActivities.filter(a => a.type === 'staff').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Aktiviteler</h2>
          <p style={{ color: TEXT2, fontSize: 14, marginTop: 4 }}>Sistemdeki tüm hareketler</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '8px 14px' }}>
          <Filter size={14} style={{ color: TEXT3 }} />
          <span style={{ color: TEXT2, fontSize: 13 }}>Son 7 gün</span>
        </div>
      </div>

      {/* Özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {(['join', 'payment', 'freeze', 'class', 'staff'] as ActivityType[]).map(type => (
          <div key={type}
            onClick={() => setActiveFilter(activeFilter === type ? 'all' : type)}
            style={{ background: activeFilter === type ? `${filterColors[type]}15` : CARD, border: `1px solid ${activeFilter === type ? `${filterColors[type]}40` : BORDER}`, borderRadius: 14, padding: '14px 16px', cursor: 'pointer' }}>
            <div style={{ color: filterColors[type], fontSize: 22, fontWeight: 700 }}>{counts[type]}</div>
            <div style={{ color: TEXT3, fontSize: 12, marginTop: 4 }}>{filterLabels[type]}</div>
          </div>
        ))}
      </div>

      {/* Filtre butonları */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(Object.keys(filterLabels) as ActivityType[]).map(type => (
          <button key={type} onClick={() => setActiveFilter(type)}
            style={{
              background: activeFilter === type ? ACCENT : CARD,
              color: activeFilter === type ? '#000' : TEXT2,
              border: `1px solid ${activeFilter === type ? ACCENT : BORDER}`,
              padding: '7px 16px', borderRadius: 10, fontSize: 13,
              fontWeight: activeFilter === type ? 700 : 400, cursor: 'pointer',
            }}>
            {filterLabels[type]}
            <span style={{ marginLeft: 6, opacity: .6, fontSize: 12 }}>{counts[type]}</span>
          </button>
        ))}
      </div>

      {/* Aktivite listesi — tarihe göre gruplu */}
      {Object.entries(grouped).map(([date, activities]) => (
        <div key={date}>
          {/* Tarih başlığı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ color: TEXT3, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{date}</span>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <span style={{ background: `${ACCENT}15`, color: ACCENT, fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>{activities.length} aktivite</span>
          </div>

          {/* Aktivite kartları */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activities.map(a => {
              const Icon = a.icon;
              return (
                <div key={a.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${ACCENT}40`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}>
                  {/* İkon */}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} style={{ color: a.color }} />
                  </div>
                  {/* İçerik */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                    <div style={{ color: TEXT3, fontSize: 12, marginTop: 3 }}>{a.detail}</div>
                  </div>
                  {/* Zaman + Tip */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ background: `${a.color}12`, color: a.color, fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 500, marginBottom: 6 }}>
                      {filterLabels[a.type as ActivityType]}
                    </div>
                    <div style={{ color: TEXT3, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <Clock size={11} />
                      {a.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
