-- Run this after supabase/schema.sql
truncate table public.cart_items restart identity;
truncate table public.wishlist restart identity;
truncate table public.product_sizes restart identity cascade;
truncate table public.products restart identity cascade;

insert into public.products (
  id, name, color, description, price, old_price, image, bg, bg_deep, accent, tagline
)
values
  (
    'blanc',
    'Arctic Halo Puffer',
    'white',
    'Tailored in luminous technical shell, this piece pairs winter protection with a refined city silhouette.',
    189,
    229,
    '/jackets/blanc.png',
    '#D9DEE5',
    '#B2BBC7',
    '#2D3748',
    'Clean lines. Quiet power.'
  ),
  (
    'bleu',
    'Cobalt Drift Jacket',
    'blue',
    'A glossy cobalt finish captures every light, while thermal loft insulation keeps movement effortless.',
    189,
    239,
    '/jackets/bleu.png',
    '#1041B6',
    '#072C85',
    '#D9E6FF',
    'Bold by every degree.'
  ),
  (
    'gris',
    'Slate Meridian Down',
    'gray',
    'Engineered quilting and a matte slate palette deliver understated luxury for cold urban mornings.',
    199,
    249,
    '/jackets/gris.png',
    '#5F6776',
    '#3C4350',
    '#F5F7FA',
    'Modern utility, elevated.'
  ),
  (
    'noir',
    'Nocturne Apex Parka',
    'black',
    'Cut in deep noir with premium insulation, designed for a commanding profile from day to midnight.',
    219,
    259,
    '/jackets/noir.png',
    '#1B1D22',
    '#090A0D',
    '#F3F4F6',
    'Presence in pure black.'
  ),
  (
    'orange',
    'Solar Ember Puffer',
    'orange',
    'Radiant orange outer shell with featherweight warmth, built to turn everyday movement into statement style.',
    149,
    199,
    '/jackets/orange.png',
    '#D15A06',
    '#A33F00',
    '#FFF1E6',
    'Stand out without trying.'
  ),
  (
    'rose',
    'Rose Velour Down',
    'pink',
    'A satin rose expression meets premium insulation to deliver an effortlessly polished cold-season layer.',
    169,
    219,
    '/jackets/rose.png',
    '#C95A8B',
    '#973763',
    '#FFE8F2',
    'Soft shade, sharp attitude.'
  ),
  (
    'rouge',
    'Crimson Core Puffer',
    'red',
    'High-density baffle construction in rich crimson creates warmth, structure, and unmistakable attitude.',
    209,
    249,
    '/jackets/rouge.png',
    '#B3202D',
    '#7F111B',
    '#FFECEF',
    'Heat for cold horizons.'
  ),
  (
    'vert',
    'Evergreen Summit Jacket',
    'green',
    'Inspired by alpine gear, this evergreen silhouette fuses expedition warmth with luxe everyday detailing.',
    199,
    239,
    '/jackets/vert.png',
    '#1F7A48',
    '#13502F',
    '#E7FFF2',
    'Trail DNA, city finish.'
  );

insert into public.product_sizes (product_id, size, stock)
values
  ('blanc', 'S', 6), ('blanc', 'M', 4), ('blanc', 'L', 0), ('blanc', 'XL', 2),
  ('bleu', 'S', 4), ('bleu', 'M', 7), ('bleu', 'L', 3), ('bleu', 'XL', 0),
  ('gris', 'S', 0), ('gris', 'M', 5), ('gris', 'L', 4), ('gris', 'XL', 2),
  ('noir', 'S', 3), ('noir', 'M', 0), ('noir', 'L', 6), ('noir', 'XL', 2),
  ('orange', 'S', 8), ('orange', 'M', 2), ('orange', 'L', 0), ('orange', 'XL', 1),
  ('rose', 'S', 5), ('rose', 'M', 0), ('rose', 'L', 3), ('rose', 'XL', 4),
  ('rouge', 'S', 1), ('rouge', 'M', 4), ('rouge', 'L', 5), ('rouge', 'XL', 0),
  ('vert', 'S', 0), ('vert', 'M', 3), ('vert', 'L', 6), ('vert', 'XL', 2);
