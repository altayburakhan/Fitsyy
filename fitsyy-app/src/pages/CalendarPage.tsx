import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, Clock, MapPin } from 'lucide-react';
import { classEvents } from '../data/mockData';
import type { ClassEvent } from '../types';
import { ACCENT, CARD, BORDER, ITEM, TEXT2, TEXT3 } from '../theme';

const typeLabels: Record<ClassEvent['type'], string> = { yoga: 'Yoga', pilates: 'Pilates', cardio: 'Kardiyo', strength: 'Güç', boxing: 'Boks', spinning: 'Spinning', zumba: 'Zumba' };
const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y: number, m: number) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

export default function CalendarPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3);
  const [selected, setSelected] = useState('2026-04-14');

  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const prevM = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextM = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const eventsFor = (day: number) => {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return classEvents.filter(e => e.date === ds);
  };
  const selEvents = classEvents.filter(e => e.date === selected).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcoming = classEvents.filter(e => e.date >= '2026-04-13').sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)).slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Ders Takvimi</h2>
          <p style={{ color: TEXT2, fontSize: 14, marginTop: 4 }}>{classEvents.length} ders planlandı</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: ACCENT, color: '#000', border: 'none', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 0 24px ${ACCENT}40` }}>
            <Plus size={16} /> Ders Ekle
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Calendar */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{MONTHS[month]} {year}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[prevM, nextM].map((fn, i) => (
                <button key={i} onClick={fn} style={{ width: 32, height: 32, background: ITEM, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i === 0 ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', color: TEXT3, fontSize: 12, fontWeight: 500, padding: '6px 0' }}>{d}</div>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const evs = eventsFor(day);
              const isSel = selected === ds;
              const isToday = ds === '2026-04-13';
              return (
                <div key={day} onClick={() => setSelected(ds)}
                  style={{
                    minHeight: 70, borderRadius: 10, padding: 6, cursor: 'pointer',
                    background: isSel ? `${ACCENT}12` : isToday ? ITEM : 'transparent',
                    border: `1px solid ${isSel ? `${ACCENT}50` : isToday ? BORDER : 'transparent'}`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                  <span style={{
                    fontSize: 12, width: 22, height: 22, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isToday ? ACCENT : 'transparent',
                    color: isToday ? '#000' : isSel ? ACCENT : TEXT2,
                    fontWeight: isToday ? 700 : 400, marginBottom: 4,
                  }}>{day}</span>
                  {evs.slice(0, 2).map(ev => (
                    <div key={ev.id} style={{ height: 5, borderRadius: 99, background: ACCENT, opacity: .7, marginBottom: 2 }} />
                  ))}
                  {evs.length > 2 && <span style={{ color: TEXT3, fontSize: 10 }}>+{evs.length - 2}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
              {selected ? new Date(selected + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }) : 'Gün Seçin'}
            </div>
            {selEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selEvents.map(ev => (
                  <div key={ev.id} style={{ background: ITEM, borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ background: `${ACCENT}15`, color: ACCENT, fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>{typeLabels[ev.type]}</span>
                      <span style={{ fontSize: 12, color: ev.enrolled >= ev.capacity ? '#f87171' : TEXT3 }}>{ev.enrolled}/{ev.capacity}</span>
                    </div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{ev.title}</div>
                    {[{ Icon: Clock, t: `${ev.startTime} – ${ev.endTime}` }, { Icon: MapPin, t: ev.room }, { Icon: Users, t: ev.trainer }].map(({ Icon, t }) => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: TEXT3, fontSize: 12, marginTop: 5 }}><Icon size={11} />{t}</div>
                    ))}
                    <div style={{ marginTop: 8, background: BORDER, borderRadius: 999, height: 5 }}>
                      <div style={{ width: `${(ev.enrolled / ev.capacity) * 100}%`, height: 5, borderRadius: 999, background: ACCENT, boxShadow: `0 0 6px ${ACCENT}50` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: TEXT3, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Bu gün için ders yok</p>}
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Yaklaşan Dersler</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 3, height: 32, borderRadius: 99, background: ACCENT, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                    <div style={{ color: TEXT3, fontSize: 11 }}>{new Date(ev.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · {ev.startTime}</div>
                  </div>
                  <span style={{ color: TEXT3, fontSize: 12 }}>{ev.enrolled}/{ev.capacity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
