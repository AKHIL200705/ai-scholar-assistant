-- ========================================================
-- AI Doubt Resolution Assistant — Supabase Database Schema
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

-- RLS Policies for saved_answers
create policy "Users can view their own saved answers" 
  on public.saved_answers 
  for select 
  to authenticated 
  using (auth.uid() = user_id);

create policy "Users can insert their own saved answers" 
  on public.saved_answers 
  for insert 
  to authenticated 
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved answers" 
  on public.saved_answers 
  for delete 
  to authenticated 
  using (auth.uid() = user_id);

-- 2. Create User Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  xp integer default 0,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile" 
  on public.profiles 
  for select 
  to authenticated 
  using (auth.uid() = id);

create policy "Users can upsert their own profile" 
  on public.profiles 
  for insert 
  to authenticated 
  with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles 
  for update 
  to authenticated 
  using (auth.uid() = id) 
  with check (auth.uid() = id);
