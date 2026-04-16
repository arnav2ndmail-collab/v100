-- Run this in your Supabase SQL editor

-- Users table (handled by Supabase Auth automatically)
-- We just add a profiles table for extra info

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists test_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  test_id text not null,
  test_path text not null,
  test_title text not null,
  subject text,
  score integer not null,
  max_score integer not null,
  correct integer not null,
  wrong integer not null,
  skipped integer default 0,
  unattempted integer default 0,
  accuracy integer not null,
  duration integer,
  marks_correct integer default 3,
  marks_wrong integer default 1,
  subj_stats jsonb default '{}',
  answers jsonb default '[]',
  taken_at timestamptz default now()
);

create table if not exists test_series (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  exam_type text default 'BITSAT',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table test_attempts enable row level security;

-- Policies: users can only see their own data
create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users see own attempts" on test_attempts for select using (auth.uid() = user_id);
create policy "Users insert own attempts" on test_attempts for insert with check (auth.uid() = user_id);
create policy "Users delete own attempts" on test_attempts for delete using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
