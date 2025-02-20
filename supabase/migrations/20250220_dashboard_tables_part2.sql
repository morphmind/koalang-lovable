-- Tetikleyiciler için güncelleme zamanı fonksiyonu
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Güncelleme zamanı tetikleyicileri
create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

create trigger handle_exercises_updated_at
    before update on public.exercises
    for each row
    execute function public.handle_updated_at();

-- RLS politikaları
alter table public.profiles enable row level security;
alter table public.quiz_results enable row level security;
alter table public.exercises enable row level security;

-- Profil politikaları
create policy "Profiller herkese açık olarak görüntülenebilir"
    on public.profiles for select
    using (true);

create policy "Kullanıcılar kendi profillerini güncelleyebilir"
    on public.profiles for update
    using (auth.uid() = id);

-- Quiz sonuçları politikaları
create policy "Kullanıcılar kendi quiz sonuçlarını görebilir"
    on public.quiz_results for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi quiz sonuçlarını ekleyebilir"
    on public.quiz_results for insert
    with check (auth.uid() = user_id);

-- Egzersiz politikaları
create policy "Kullanıcılar kendi egzersizlerini görebilir"
    on public.exercises for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi egzersizlerini yönetebilir"
    on public.exercises for all
    using (auth.uid() = user_id);
