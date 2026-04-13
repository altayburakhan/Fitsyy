import type { Member, Staff, ClassEvent, Transaction } from '../types';

export const members: Member[] = [
  { id: '1', name: 'Ayşe Kaya', email: 'ayse@example.com', phone: '0532 111 2233', plan: 'premium', status: 'active', joinDate: '2025-01-15', renewalDate: '2026-01-15', age: 28, gender: 'female', attendanceThisMonth: 18 },
  { id: '2', name: 'Mehmet Demir', email: 'mehmet@example.com', phone: '0533 222 3344', plan: 'standard', status: 'active', joinDate: '2025-03-01', renewalDate: '2026-03-01', age: 35, gender: 'male', attendanceThisMonth: 12 },
  { id: '3', name: 'Zeynep Arslan', email: 'zeynep@example.com', phone: '0534 333 4455', plan: 'basic', status: 'active', joinDate: '2025-06-10', renewalDate: '2026-06-10', age: 24, gender: 'female', attendanceThisMonth: 8 },
  { id: '4', name: 'Ali Yılmaz', email: 'ali@example.com', phone: '0535 444 5566', plan: 'premium', status: 'frozen', joinDate: '2024-11-20', renewalDate: '2025-11-20', age: 42, gender: 'male', attendanceThisMonth: 0 },
  { id: '5', name: 'Fatma Çelik', email: 'fatma@example.com', phone: '0536 555 6677', plan: 'standard', status: 'active', joinDate: '2025-02-14', renewalDate: '2026-02-14', age: 31, gender: 'female', attendanceThisMonth: 15 },
  { id: '6', name: 'Emre Şahin', email: 'emre@example.com', phone: '0537 666 7788', plan: 'basic', status: 'inactive', joinDate: '2024-09-05', renewalDate: '2025-09-05', age: 27, gender: 'male', attendanceThisMonth: 0 },
  { id: '7', name: 'Selin Özkan', email: 'selin@example.com', phone: '0538 777 8899', plan: 'premium', status: 'active', joinDate: '2025-04-22', renewalDate: '2026-04-22', age: 33, gender: 'female', attendanceThisMonth: 22 },
  { id: '8', name: 'Can Koçak', email: 'can@example.com', phone: '0539 888 9900', plan: 'standard', status: 'active', joinDate: '2025-05-18', renewalDate: '2026-05-18', age: 29, gender: 'male', attendanceThisMonth: 10 },
  { id: '9', name: 'Nur Aydın', email: 'nur@example.com', phone: '0530 999 0011', plan: 'premium', status: 'active', joinDate: '2025-01-08', renewalDate: '2026-01-08', age: 26, gender: 'female', attendanceThisMonth: 19 },
  { id: '10', name: 'Burak Güler', email: 'burak@example.com', phone: '0531 000 1122', plan: 'basic', status: 'active', joinDate: '2025-07-01', renewalDate: '2026-07-01', age: 38, gender: 'male', attendanceThisMonth: 6 },
];

export const staff: Staff[] = [
  { id: '1', name: 'Hakan Akın', role: 'manager', email: 'hakan@fitsyy.com', phone: '0532 100 2000', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], salary: 25000, joinDate: '2023-01-01', status: 'active' },
  { id: '2', name: 'Elif Korkmaz', role: 'trainer', email: 'elif@fitsyy.com', phone: '0533 200 3000', schedule: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'], salary: 18000, joinDate: '2023-06-15', status: 'active' },
  { id: '3', name: 'Serkan Doğan', role: 'trainer', email: 'serkan@fitsyy.com', phone: '0534 300 4000', schedule: ['Tue', 'Wed', 'Thu', 'Sat', 'Sun'], salary: 18000, joinDate: '2024-02-01', status: 'active' },
  { id: '4', name: 'Pınar Toprak', role: 'receptionist', email: 'pinar@fitsyy.com', phone: '0535 400 5000', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], salary: 14000, joinDate: '2023-09-01', status: 'active' },
  { id: '5', name: 'Murat Bal', role: 'trainer', email: 'murat@fitsyy.com', phone: '0536 500 6000', schedule: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'], salary: 19000, joinDate: '2024-05-10', status: 'active' },
  { id: '6', name: 'Deniz Eren', role: 'cleaner', email: 'deniz@fitsyy.com', phone: '0537 600 7000', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], salary: 10000, joinDate: '2023-03-20', status: 'active' },
];

export const classEvents: ClassEvent[] = [
  { id: '1', title: 'Sabah Yoga', trainer: 'Elif Korkmaz', date: '2026-04-14', startTime: '08:00', endTime: '09:00', capacity: 15, enrolled: 12, room: 'Stüdyo A', type: 'yoga', color: '#8b5cf6' },
  { id: '2', title: 'HIIT Cardio', trainer: 'Serkan Doğan', date: '2026-04-14', startTime: '10:00', endTime: '11:00', capacity: 20, enrolled: 18, room: 'Ana Salon', type: 'cardio', color: '#f97316' },
  { id: '3', title: 'Pilates', trainer: 'Elif Korkmaz', date: '2026-04-14', startTime: '17:00', endTime: '18:00', capacity: 12, enrolled: 10, room: 'Stüdyo B', type: 'pilates', color: '#ec4899' },
  { id: '4', title: 'Boks Dersi', trainer: 'Murat Bal', date: '2026-04-15', startTime: '09:00', endTime: '10:00', capacity: 10, enrolled: 8, room: 'Boks Salonu', type: 'boxing', color: '#ef4444' },
  { id: '5', title: 'Spinning', trainer: 'Serkan Doğan', date: '2026-04-15', startTime: '11:00', endTime: '12:00', capacity: 15, enrolled: 15, room: 'Spinning Salonu', type: 'spinning', color: '#eab308' },
  { id: '6', title: 'Zumba', trainer: 'Elif Korkmaz', date: '2026-04-15', startTime: '18:00', endTime: '19:00', capacity: 25, enrolled: 20, room: 'Ana Salon', type: 'zumba', color: '#06b6d4' },
  { id: '7', title: 'Güç Antrenmanı', trainer: 'Murat Bal', date: '2026-04-16', startTime: '07:00', endTime: '08:00', capacity: 15, enrolled: 9, room: 'Ağırlık Salonu', type: 'strength', color: '#22c55e' },
  { id: '8', title: 'Akşam Yoga', trainer: 'Elif Korkmaz', date: '2026-04-16', startTime: '19:00', endTime: '20:00', capacity: 15, enrolled: 13, room: 'Stüdyo A', type: 'yoga', color: '#8b5cf6' },
  { id: '9', title: 'Pilates', trainer: 'Elif Korkmaz', date: '2026-04-17', startTime: '10:00', endTime: '11:00', capacity: 12, enrolled: 7, room: 'Stüdyo B', type: 'pilates', color: '#ec4899' },
  { id: '10', title: 'HIIT Cardio', trainer: 'Murat Bal', date: '2026-04-17', startTime: '18:00', endTime: '19:00', capacity: 20, enrolled: 16, room: 'Ana Salon', type: 'cardio', color: '#f97316' },
];

export const transactions: Transaction[] = [
  { id: '1', type: 'income', category: 'Üyelik', description: 'Aylık Premium Üyelik - Ayşe Kaya', amount: 1500, date: '2026-04-01', paymentMethod: 'Kredi Kartı' },
  { id: '2', type: 'income', category: 'Üyelik', description: 'Aylık Standard Üyelik - Mehmet Demir', amount: 900, date: '2026-04-01', paymentMethod: 'Havale' },
  { id: '3', type: 'expense', category: 'Kira', description: 'Nisan Ayı Salon Kirası', amount: 15000, date: '2026-04-01', paymentMethod: 'EFT' },
  { id: '4', type: 'income', category: 'Kurs', description: 'Özel PT Seansı - Selin Özkan', amount: 800, date: '2026-04-02', paymentMethod: 'Nakit' },
  { id: '5', type: 'expense', category: 'Maaş', description: 'Çalışan Maaşları - Nisan', amount: 104000, date: '2026-04-03', paymentMethod: 'EFT' },
  { id: '6', type: 'income', category: 'Üyelik', description: 'Aylık Basic Üyelik - Zeynep Arslan', amount: 500, date: '2026-04-03', paymentMethod: 'Kredi Kartı' },
  { id: '7', type: 'expense', category: 'Ekipman', description: 'Yeni Koşu Bandı Alımı', amount: 25000, date: '2026-04-05', paymentMethod: 'Kredi Kartı' },
  { id: '8', type: 'income', category: 'Kurs', description: 'Grup Dersleri Geliri', amount: 12000, date: '2026-04-07', paymentMethod: 'Çeşitli' },
  { id: '9', type: 'expense', category: 'Elektrik/Su', description: 'Nisan Faturalar', amount: 3500, date: '2026-04-08', paymentMethod: 'Otomatik Ödeme' },
  { id: '10', type: 'income', category: 'Üyelik', description: 'Toplu Üyelik Ödemeleri', amount: 32000, date: '2026-04-10', paymentMethod: 'Çeşitli' },
  { id: '11', type: 'expense', category: 'Temizlik', description: 'Temizlik Malzemeleri', amount: 1200, date: '2026-04-11', paymentMethod: 'Nakit' },
  { id: '12', type: 'income', category: 'Market', description: 'Protein Bar & Supplement Satışı', amount: 4500, date: '2026-04-12', paymentMethod: 'Çeşitli' },
  { id: '13', type: 'expense', category: 'Pazarlama', description: 'Sosyal Medya Reklamları', amount: 3000, date: '2026-04-12', paymentMethod: 'Kredi Kartı' },
  { id: '14', type: 'income', category: 'Kurs', description: 'Özel PT Seansları', amount: 5600, date: '2026-04-13', paymentMethod: 'Nakit' },
];

export const monthlyRevenue = [
  { month: 'Eki', gelir: 68000, gider: 55000 },
  { month: 'Kas', gelir: 72000, gider: 57000 },
  { month: 'Ara', gelir: 85000, gider: 62000 },
  { month: 'Oca', gelir: 91000, gider: 58000 },
  { month: 'Şub', gelir: 87000, gider: 60000 },
  { month: 'Mar', gelir: 95000, gider: 61000 },
  { month: 'Nis', gelir: 102000, gider: 65000 },
];

export const membershipDistribution = [
  { name: 'Premium', value: 42, color: '#8b5cf6' },
  { name: 'Standard', value: 35, color: '#3b82f6' },
  { name: 'Basic', value: 23, color: '#22c55e' },
];

export const expenseBreakdown = [
  { category: 'Maaşlar', amount: 104000, color: '#f97316' },
  { category: 'Kira', amount: 15000, color: '#ef4444' },
  { category: 'Ekipman', amount: 25000, color: '#8b5cf6' },
  { category: 'Faturalar', amount: 3500, color: '#eab308' },
  { category: 'Pazarlama', amount: 3000, color: '#06b6d4' },
  { category: 'Diğer', amount: 4200, color: '#94a3b8' },
];
