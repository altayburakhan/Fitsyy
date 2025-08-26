-- RLS aç
alter table public.tenants enable row level security;
alter table public.members enable row level security;
alter table public.time_slots enable row level security;

-- Politika: tenants okunabilsin
create policy "tenants read public" on public.tenants
for select using (true);

-- Politika: members okunabilsin
create policy "members read public" on public.members
for select using (true);

-- Politika: members insert (demo amaçlı, herkes ekleyebilsin)
create policy "members insert public (demo)" on public.members
for insert with check (true);

-- Politika: time_slots okunabilsin
create policy "time_slots read public" on public.time_slots
for select using (true);

-- Politika: time_slots insert (demo amaçlı)
create policy "time_slots insert public (demo)" on public.time_slots
for insert with check (true);
