-- Créer l'extension pour UUID
create extension if not exists pgcrypto;

-- SUPPRIMER LES TABLES SI ELLES EXISTENT (ordre inverse pour les clés étrangères)
drop table if exists public.wishlist cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.product_sizes cascade;
drop table if exists public.products cascade;

-- TABLE products
create table public.products (
  id text primary key,
  name text not null,
  color text not null,
  description text not null,
  price integer not null check (price > 0),
  old_price integer not null check (old_price > 0),
  image text not null,
  bg text not null,
  bg_deep text not null,
  accent text not null,
  tagline text not null
);

-- TABLE product_sizes (stocks par taille)
create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  stock integer not null check (stock >= 0),
  unique (product_id, size)
);

-- TABLE cart_items (panier)
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  quantity integer not null check (quantity > 0),
  unique (product_id, size)
);

-- TABLE wishlist (liste de souhaits)
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  unique (product_id)
);

-- ACTIVER ROW LEVEL SECURITY
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist enable row level security;

-- POLITIQUES DE SÉCURITÉ pour products
drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products
  for select
  to anon
  using (true);

-- POLITIQUES DE SÉCURITÉ pour product_sizes
drop policy if exists "Public read product sizes" on public.product_sizes;
create policy "Public read product sizes"
  on public.product_sizes
  for select
  to anon
  using (true);

-- POLITIQUES DE SÉCURITÉ pour cart_items
drop policy if exists "Public read cart items" on public.cart_items;
drop policy if exists "Public write cart items" on public.cart_items;
create policy "Public read cart items"
  on public.cart_items
  for select
  to anon
  using (true);
create policy "Public write cart items"
  on public.cart_items
  for all
  to anon
  using (true)
  with check (true);

-- POLITIQUES DE SÉCURITÉ pour wishlist
drop policy if exists "Public read wishlist" on public.wishlist;
drop policy if exists "Public write wishlist" on public.wishlist;
create policy "Public read wishlist"
  on public.wishlist
  for select
  to anon
  using (true);
create policy "Public write wishlist"
  on public.wishlist
  for all
  to anon
  using (true)
  with check (true);