-- =====================================================================
-- SahiKaam database schema
-- Supabase Dashboard > SQL Editor > New query > paste this whole file > Run
-- =====================================================================

-- ---------- Products (ebooks, courses, bundles) ----------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  type          text not null check (type in ('ebook','course','bundle')),
  title         text not null,
  subtitle      text,
  description   text,
  price         integer not null default 0,       -- in RUPEES (e.g. 4999). 0 = free
  mrp           integer,                          -- strike-through price, optional
  badge         text,                             -- e.g. "NEW", "BESTSELLER"
  cover_color   text default '#C2410C',
  cover_url     text,                             -- optional public image URL
  file_path     text,                             -- ebook PDF path inside private bucket "books"
  pages         integer,
  language      text default 'Hindi + English',
  highlights    jsonb default '[]'::jsonb,        -- [{"title":"50","text":"Business ideas"}]
  chapters      jsonb default '[]'::jsonb,        -- ["Chapter 1 title", ...]
  lessons       jsonb default '[]'::jsonb,        -- courses: [{"title":"..","video_url":"..","minutes":12}]
  bundle_items  text[] default '{}',              -- bundles: slugs of included products
  is_published  boolean not null default true,
  sort_order    integer not null default 100,
  created_at    timestamptz not null default now()
);

-- ---------- Coupons ----------
create table if not exists public.coupons (
  code          text primary key,                 -- store UPPERCASE, e.g. LAUNCH20
  percent_off   integer check (percent_off between 1 and 100),
  flat_off      integer check (flat_off > 0),     -- rupees
  product_slug  text,                             -- null = valid on all products
  max_uses      integer,                          -- null = unlimited
  used_count    integer not null default 0,
  expires_at    timestamptz,
  is_active     boolean not null default true
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  product_id           uuid not null references public.products(id),
  amount               integer not null,          -- rupees charged
  coupon_code          text,
  razorpay_order_id    text unique,
  razorpay_payment_id  text,
  status               text not null default 'created' check (status in ('created','paid','failed')),
  created_at           timestamptz not null default now(),
  paid_at              timestamptz
);

-- ---------- Purchases (what a user can access) ----------
create table if not exists public.purchases (
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  order_id    uuid references public.orders(id),
  progress    integer not null default 0,         -- last page read / lessons done
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------- Row Level Security ----------
alter table public.products  enable row level security;
alter table public.coupons   enable row level security;
alter table public.orders    enable row level security;
alter table public.purchases enable row level security;

drop policy if exists "public reads published products" on public.products;
create policy "public reads published products" on public.products
  for select using (is_published = true);

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "users read own purchases" on public.purchases;
create policy "users read own purchases" on public.purchases
  for select using (auth.uid() = user_id);

drop policy if exists "users update own progress" on public.purchases;
create policy "users update own progress" on public.purchases
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- coupons: no public policy -> only the server (service role) can read them.
-- orders/purchases inserts happen only on the server with the service role key.

-- ---------- Atomic coupon counter ----------
create or replace function public.increment_coupon(p_code text)
returns void language sql security definer as $$
  update public.coupons set used_count = used_count + 1 where code = p_code;
$$;
revoke all on function public.increment_coupon(text) from public, anon, authenticated;

-- ---------- Private storage bucket for ebook PDFs ----------
insert into storage.buckets (id, name, public)
values ('books', 'books', false)
on conflict (id) do nothing;
-- No storage policies are added on purpose: files are only reachable through
-- short-lived signed URLs the server creates after checking the purchase.
