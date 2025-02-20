-- İndeksler
create index if not exists idx_profiles_created_at on public.profiles(created_at);
create index if not exists idx_quiz_results_user_id on public.quiz_results(user_id);
create index if not exists idx_exercises_user_id on public.exercises(user_id);
create index if not exists idx_exercises_completed on public.exercises(completed);

-- Admin rolü için görüntüleme izinleri
create policy "Adminler tüm profilleri görebilir"
    on public.profiles for select
    using (auth.uid() in (
        select id from public.profiles
        where id = auth.uid() and username = 'admin'
    ));

create policy "Adminler tüm quiz sonuçlarını görebilir"
    on public.quiz_results for select
    using (auth.uid() in (
        select id from public.profiles
        where id = auth.uid() and username = 'admin'
    ));

create policy "Adminler tüm egzersizleri görebilir"
    on public.exercises for select
    using (auth.uid() in (
        select id from public.profiles
        where id = auth.uid() and username = 'admin'
    ));
