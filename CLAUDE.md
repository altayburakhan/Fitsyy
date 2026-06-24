# FitSyy - Claude Talimatları

## Genel Bakış

FitSyy, spor salonları için **multi-tenant SaaS** yönetim uygulamasıdır. Her spor salonu kendi hesabıyla giriş yapar; veriler birbirinden izole tutulur. Ürün olarak geliştirilmektedir — taşınabilirlik ve güvenlik önceliklidir.

**Stack:**
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
- Deploy: Vercel (frontend) + Supabase (backend)

---

## Ürün Kararları

### Salon Tipleri

Desteklenen üç salon tipi: `fitness`, `pilates`, `sports` (spor salonu).

**Karar: Tek dashboard, gym_type'a göre widget göster/gizle.**
- Ayrı dashboard yok — core metrikler (üye, gelir, katılım, takvim) tüm tipler için aynı
- `gyms.type` kolonuna göre ilgili widget'lar öne çıkar veya gizlenir
- Örnek: pilates → ders doluluk oranı ön planda; fitness → alan/ekipman; sports → kort rezervasyonu
- Kurulum akışında kullanıcı salon tipini seçer → `gyms.type` olarak kaydedilir → dashboard buna göre ayarlanır

```ts
type GymType = 'fitness' | 'pilates' | 'sports';
```

---

## Geliştirme Ortamı

- Proje dizini: `/mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy-main/fitsyy-app`
- Framework: React + Vite + TypeScript + Tailwind CSS
- Tema rengi: `#55EDB4` (mint) — `src/theme.ts` dosyasında tanımlı

---

## Supabase — Genel Bakış

Supabase, open-source bir Firebase alternatifidir. PostgreSQL üzerine kuruludur; Auth, Storage, Realtime ve Edge Functions içerir. Lisansı açık olduğu için gerektiğinde self-host'a geçilebilir.

**Proje yapısı:**
- Her `gym` (spor salonu) bir `tenant` olarak çalışır
- Tüm tablolar `gym_id` kolonu içerir — RLS ile her salon yalnızca kendi satırlarını okuyabilir
- Auth katmanı Supabase Auth üzerinden yönetilir; kullanıcılar `gyms` tablosundaki bir salona bağlıdır

---

## 1. Supabase Kurulum

### 1.1 Supabase Projesi Oluşturma

1. [supabase.com](https://supabase.com) adresine git → `New Project` oluştur
2. Proje adı: `fitsyy` — region: `eu-central-1` (Frankfurt) önerilir
3. Güçlü bir DB şifresi belirle ve kaydet (bir daha görünmez)
4. Proje oluştuktan sonra `Settings → API` sekmesine git:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon / public key` → `VITE_SUPABASE_ANON_KEY`

### 1.2 .env Dosyası

`fitsyy-app/.env.local` dosyası oluştur (`.gitignore`'a eklendiğinden commit'e gitmez):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 1.3 Supabase JS Client Kurulumu

```bash
cd /mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy-main/fitsyy-app
npm install @supabase/supabase-js
```

`src/lib/supabase.ts` dosyası oluştur:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

Bu client tüm uygulama genelinde import edilerek kullanılır.

### 1.4 Temel Tablo Şeması

Supabase SQL Editor'de sırayla çalıştır:

```sql
-- Spor salonları (tenant tablosu)
create table gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Kullanıcılar (Supabase Auth ile bağlı)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  gym_id uuid references gyms(id) on delete cascade,
  full_name text,
  role text check (role in ('owner', 'manager', 'trainer', 'receptionist')) default 'owner',
  created_at timestamptz default now()
);

-- Üyeler
create table members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references gyms(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  plan text check (plan in ('basic', 'standard', 'premium')) default 'basic',
  status text check (status in ('active', 'inactive', 'frozen')) default 'active',
  join_date date default current_date,
  renewal_date date,
  age int,
  gender text check (gender in ('male', 'female')),
  attendance_this_month int default 0,
  created_at timestamptz default now()
);

-- Çalışanlar
create table staff (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references gyms(id) on delete cascade not null,
  name text not null,
  role text check (role in ('trainer', 'receptionist', 'manager', 'cleaner')) not null,
  email text,
  phone text,
  salary numeric,
  join_date date default current_date,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamptz default now()
);

-- Dersler / Etkinlikler
create table class_events (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references gyms(id) on delete cascade not null,
  title text not null,
  trainer text,
  date date not null,
  start_time time not null,
  end_time time not null,
  capacity int default 20,
  enrolled int default 0,
  room text,
  type text check (type in ('yoga','pilates','cardio','strength','boxing','spinning','zumba')),
  created_at timestamptz default now()
);

-- Finansal işlemler
create table transactions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references gyms(id) on delete cascade not null,
  type text check (type in ('income','expense')) not null,
  category text,
  description text,
  amount numeric not null,
  payment_method text,
  date date default current_date,
  created_at timestamptz default now()
);
```

---

## 2. Supabase MCP Entegrasyonu

Supabase resmi bir MCP (Model Context Protocol) server sunar. Bu sayede Claude, Supabase projesini doğrudan okuyup SQL çalıştırabilir.

### 2.1 Kurulum

```bash
npm install -g @supabase/mcp-server-supabase
```

### 2.2 Claude Code MCP Ayarı

`~/.claude/settings.json` veya proje `.claude/settings.json` dosyasına ekle:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "https://xxxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJ..."
      }
    }
  }
}
```

> **Dikkat:** MCP için `service_role` key kullanılır (anon key değil). Bu key `Settings → API → service_role` altındadır. Hiçbir zaman frontend koduna veya public repoya ekleme.

### 2.3 MCP Aktif Olunca Ne Yapılabilir

- Claude, `select * from members` gibi sorgular çalıştırabilir
- Tablo şemalarını okuyabilir, migration yazabilir
- Hata ayıklama için RLS politikalarını inceleyebilir

---

## 3. Supabase Rol Atama

Multi-tenant yapıda kullanıcıların rolleri `profiles.role` kolonu ile yönetilir.

### 3.1 Roller ve Yetkileri

| Rol | Açıklama | Erişim |
|---|---|---|
| `owner` | Salon sahibi | Tüm veriler, ayarlar, finans |
| `manager` | Yönetici | Üyeler, çalışanlar, takvim, finans (okuma) |
| `trainer` | Antrenör | Yalnızca kendi dersleri ve üye listesi |
| `receptionist` | Resepsiyon | Üyeler ve takvim |

### 3.2 Auth Trigger — Yeni Kullanıcıya Otomatik Profil

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3.3 Rol Kontrolü Frontend'de

```ts
const { data: profile } = await supabase
  .from('profiles')
  .select('role, gym_id')
  .eq('id', user.id)
  .single();

// Finansa sadece owner ve manager erişebilir
if (!['owner', 'manager'].includes(profile.role)) {
  navigate('/');
}
```

---

## 4. Güvenlik Ayarları

### 4.1 Row Level Security (RLS) — Zorunlu

Her tablo için RLS aktif edilmeli ve politikalar tanımlanmalıdır. Aksi halde tüm kullanıcılar tüm verilere erişebilir.

```sql
-- RLS'yi aktif et
alter table members enable row level security;
alter table staff enable row level security;
alter table class_events enable row level security;
alter table transactions enable row level security;
alter table profiles enable row level security;

-- Kullanıcı kendi salonunun üyelerini görebilir
create policy "gym members visible to gym users"
  on members for select
  using (
    gym_id = (
      select gym_id from profiles where id = auth.uid()
    )
  );

-- Aynı pattern tüm tablolara uygulanır (insert, update, delete için de)
create policy "gym members insert"
  on members for insert
  with check (
    gym_id = (select gym_id from profiles where id = auth.uid())
  );

create policy "gym members update"
  on members for update
  using (
    gym_id = (select gym_id from profiles where id = auth.uid())
  );

create policy "gym members delete"
  on members for delete
  using (
    gym_id = (select gym_id from profiles where id = auth.uid())
  );
```

> Bu pattern `staff`, `class_events`, `transactions` tablolarına da birebir uygulanır.

### 4.2 Güvenlik Kuralları

- `anon key` sadece frontend'e girer — RLS ile korunur
- `service_role key` asla frontend'e girmez — yalnızca MCP/backend/migration için
- `.env.local` dosyası `.gitignore`'da olmalı
- Supabase Dashboard → `Auth → Settings` altında:
  - `Enable email confirmations`: Prodüksiyonda açık olmalı
  - `Disable signup`: Kullanıcı kaydı sadece davet ile olacaksa kapat

### 4.3 API Güvenlik Kontrol Listesi

- [ ] Tüm tablolarda RLS aktif
- [ ] Her tablo için select/insert/update/delete politikaları var
- [ ] `service_role` key hiçbir zaman commit edilmedi
- [ ] `.env.local` `.gitignore`'da
- [ ] Auth email doğrulaması aktif (prod)

### 4.4 Supabase Vault (Hassas Veri)

Gelecekte API key, webhook secret gibi hassas veriler saklanacaksa `Supabase Vault` kullan:

```sql
select vault.create_secret('stripe_key', 'sk_live_...');
select vault.read_secret('stripe_key');
```

---

## Kod değişikliği sonrası yapılacaklar

Her kod değişikliğinin ardından şu adımları takip et:

1. **Build ile doğrula** — her zaman önce build al:
   ```
   cd /mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy-main/fitsyy-app && npm run build
   ```

2. **Dev server'ı yeniden başlat** — değişiklikler tarayıcıya yansımıyorsa mevcut server'ı öldür ve yeni port ile başlat:
   ```
   pkill -f vite
   cd /mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy-main/fitsyy-app
   npm run dev -- --host --port 4200 > /tmp/vite.log 2>&1 &
   sleep 6 && cat /tmp/vite.log
   ```
   Ardından kullanıcıya **http://localhost:4200** adresini ver.

3. **Cache sorunu varsa** — kullanıcıya şunu söyle:
   > Tarayıcıda **Ctrl + Shift + R** (Windows/Linux) veya **Cmd + Shift + R** (Mac) ile sert yenile.

---

## Yaygın sorunlar

| Sorun | Çözüm |
|---|---|
| Değişiklik yansımıyor | Dev server'ı yeniden başlat, yeni port kullan |
| Port kullanımda | 4200, 4500, 8080 gibi yüksek port dene |
| Build hatası | `npm run build` çıktısına bak, TypeScript hatasını düzelt |
| Push edilmiyor | `git status` ile durumu kontrol et, önce commit yap |
| RLS hatası (403) | Politika eksik ya da `gym_id` eşleşmiyor — SQL Editor'de test et |
| Auth token süresi doldu | `supabase.auth.refreshSession()` çağır veya kullanıcıyı yeniden giriş yaptır |

---

## Push akışı

```bash
cd /mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy-main
git add .
git commit -m "değişiklik açıklaması"
git push origin main
```
