
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  gemini_api_key text,
  preferred_model text not null default 'gemini-2.0-flash',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  brief jsonb not null default '{}'::jsonb,
  article_paste text not null default '',
  extraction jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  platforms_selected text[] not null default '{}',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "campaigns_select_own" on public.campaigns for select using (auth.uid() = user_id);
create policy "campaigns_insert_own" on public.campaigns for insert with check (auth.uid() = user_id);
create policy "campaigns_update_own" on public.campaigns for update using (auth.uid() = user_id);
create policy "campaigns_delete_own" on public.campaigns for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger campaigns_updated_at before update on public.campaigns
  for each row execute function public.touch_updated_at();
