-- Profil tablosu oluşturma (auth.users ile ilişkili)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quiz sonuçları tablosu
create table if not exists public.quiz_results (
    id bigint generated by default as identity primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    quiz_type text not null,
    score numeric(5,2) not null,
    total_questions integer not null,
    correct_answers integer not null,
    duration_seconds integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Egzersiz tablosu
create table if not exists public.exercises (
    id bigint generated by default as identity primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    exercise_type text not null,
    title text not null,
    description text,
    completed boolean default false,
    completion_date timestamp with time zone,
    target_completion_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
