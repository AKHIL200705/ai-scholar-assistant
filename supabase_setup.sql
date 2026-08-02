-- ========================================================
-- AI Doubt Resolution Assistant — Safe Idempotent SQL Setup
-- Run this script in Supabase Dashboard SQL Editor
-- ========================================================

-- 1. Create Saved Answers Table
create table if not exists public.saved_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  subject text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.saved_answers enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view their own saved answers" on public.saved_answers;
drop policy if exists "Users can insert their own saved answers" on public.saved_answers;
drop policy if exists "Users can delete their own saved answers" on public.saved_answers;

-- RLS Policies for saved_answers
create policy "Users can view their own saved answers" 
  on public.saved_answers 
  for select 
  to authenticated 
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own saved answers" 
  on public.saved_answers 
  for insert 
  to authenticated 
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own saved answers" 
  on public.saved_answers 
  for delete 
  to authenticated 
  using ((select auth.uid()) = user_id);

-- 2. Create User Profiles Table & Automatic Google OAuth Sync
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  xp integer default 0,
  openai_api_key text,
  ai_provider text default 'gpt-4o-mini',
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- RLS Policies for profiles
create policy "Users can view their own profile" 
  on public.profiles 
  for select 
  to authenticated 
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile" 
  on public.profiles 
  for insert 
  to authenticated 
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile" 
  on public.profiles 
  for update 
  to authenticated 
  using ((select auth.uid()) = id) 
  with check ((select auth.uid()) = id);

-- Automatic Profile Creation Trigger for Google OAuth & Email Signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    now()
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

-- Trigger automatic profile sync on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. Create Conversations Table for ChatGPT / AI Threads
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subject text default 'General',
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;

drop policy if exists "Users can view their own conversations" on public.conversations;
drop policy if exists "Users can insert their own conversations" on public.conversations;
drop policy if exists "Users can update their own conversations" on public.conversations;
drop policy if exists "Users can delete their own conversations" on public.conversations;

create policy "Users can view their own conversations" 
  on public.conversations for select 
  to authenticated 
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own conversations" 
  on public.conversations for insert 
  to authenticated 
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own conversations" 
  on public.conversations for update 
  to authenticated 
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own conversations" 
  on public.conversations for delete 
  to authenticated 
  using ((select auth.uid()) = user_id);

-- 4. Create Chat Messages Table for ChatGPT / AI Responses
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'ai', 'system')),
  content text not null,
  subject text default 'General',
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

drop policy if exists "Users can view their own chat messages" on public.chat_messages;
drop policy if exists "Users can insert their own chat messages" on public.chat_messages;
drop policy if exists "Users can delete their own chat messages" on public.chat_messages;

create policy "Users can view their own chat messages" 
  on public.chat_messages for select 
  to authenticated 
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own chat messages" 
  on public.chat_messages for insert 
  to authenticated 
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own chat messages" 
  on public.chat_messages for delete 
  to authenticated 
  using ((select auth.uid()) = user_id);

-- 5. Enable Realtime Subscriptions
alter publication supabase_realtime add table public.saved_answers;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.chat_messages;

