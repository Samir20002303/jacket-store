// src/data/products.ts
import { supabase } from '@/src/lib/supabase'

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export type ProductTheme = {
  bg: string;
  bgDeep: string;
  accent: string;
};

export type Product = {
  id: string;
  color: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  oldPrice: number;
  image: string;
  theme: ProductTheme;
  sizes: Record<Size, number>;
  tagline: string;
};

// Données locales (fallback)
export const localProducts: Product[] = [
  {
    id: "blanc",
    color: "white",
    name: "Arctic Halo Puffer",
    subtitle: "Clean lines. Quiet power.",
    description:
      "Tailored in luminous technical shell, this piece pairs winter protection with a refined city silhouette.",
    price: 189,
    oldPrice: 229,
    image: "/jackets/blanc.png",
    theme: {
      bg: "#D9DEE5",
      bgDeep: "#B2BBC7",
      accent: "#2D3748",
    },
    sizes: { S: 6, M: 4, L: 0, XL: 2 },
    tagline: "Light tone, bold intent.",
  },
  {
    id: "bleu",
    color: "blue",
    name: "Cobalt Drift Jacket",
    subtitle: "Bold by every degree.",
    description:
      "A glossy cobalt finish captures every light, while thermal loft insulation keeps movement effortless.",
    price: 189,
    oldPrice: 239,
    image: "/jackets/bleu.png",
    theme: {
      bg: "#1041B6",
      bgDeep: "#072C85",
      accent: "#D9E6FF",
    },
    sizes: { S: 4, M: 7, L: 3, XL: 0 },
    tagline: "Loud color, quiet warmth.",
  },
  {
    id: "gris",
    color: "gray",
    name: "Slate Meridian Down",
    subtitle: "Modern utility, elevated.",
    description:
      "Engineered quilting and a matte slate palette deliver understated luxury for cold urban mornings.",
    price: 199,
    oldPrice: 249,
    image: "/jackets/gris.png",
    theme: {
      bg: "#5F6776",
      bgDeep: "#3C4350",
      accent: "#F5F7FA",
    },
    sizes: { S: 0, M: 5, L: 4, XL: 2 },
    tagline: "Built for city weather shifts.",
  },
  {
    id: "noir",
    color: "black",
    name: "Nocturne Apex Parka",
    subtitle: "Presence in pure black.",
    description:
      "Cut in deep noir with premium insulation, designed for a commanding profile from day to midnight.",
    price: 219,
    oldPrice: 259,
    image: "/jackets/noir.png",
    theme: {
      bg: "#1B1D22",
      bgDeep: "#090A0D",
      accent: "#F3F4F6",
    },
    sizes: { S: 3, M: 0, L: 6, XL: 2 },
    tagline: "Minimal by design, maximal by impact.",
  },
  {
    id: "orange",
    color: "orange",
    name: "Solar Ember Puffer",
    subtitle: "Stand out without trying.",
    description:
      "Radiant orange outer shell with featherweight warmth, built to turn everyday movement into statement style.",
    price: 149,
    oldPrice: 199,
    image: "/jackets/orange.png",
    theme: {
      bg: "#D15A06",
      bgDeep: "#A33F00",
      accent: "#FFF1E6",
    },
    sizes: { S: 8, M: 2, L: 0, XL: 1 },
    tagline: "Confidence, wrapped in warmth.",
  },
  {
    id: "rose",
    color: "pink",
    name: "Rose Velour Down",
    subtitle: "Soft shade, sharp attitude.",
    description:
      "A satin rose expression meets premium insulation to deliver an effortlessly polished cold-season layer.",
    price: 169,
    oldPrice: 219,
    image: "/jackets/rose.png",
    theme: {
      bg: "#C95A8B",
      bgDeep: "#973763",
      accent: "#FFE8F2",
    },
    sizes: { S: 5, M: 0, L: 3, XL: 4 },
    tagline: "Romance meets street precision.",
  },
  {
    id: "rouge",
    color: "red",
    name: "Crimson Core Puffer",
    subtitle: "Heat for cold horizons.",
    description:
      "High-density baffle construction in rich crimson creates warmth, structure, and unmistakable attitude.",
    price: 209,
    oldPrice: 249,
    image: "/jackets/rouge.png",
    theme: {
      bg: "#B3202D",
      bgDeep: "#7F111B",
      accent: "#FFECEF",
    },
    sizes: { S: 1, M: 4, L: 5, XL: 0 },
    tagline: "For nights with a pulse.",
  },
  {
    id: "vert",
    color: "green",
    name: "Evergreen Summit Jacket",
    subtitle: "Trail DNA, city finish.",
    description:
      "Inspired by alpine gear, this evergreen silhouette fuses expedition warmth with luxe everyday detailing.",
    price: 199,
    oldPrice: 239,
    image: "/jackets/vert.png",
    theme: {
      bg: "#1F7A48",
      bgDeep: "#13502F",
      accent: "#E7FFF2",
    },
    sizes: { S: 0, M: 3, L: 6, XL: 2 },
    tagline: "Natural tone, premium edge.",
  },
];

// Type pour les données brutes de Supabase
type SupabaseProduct = {
  id: string;
  color: string;
  name: string;
  description: string;
  price: number;
  old_price: number;
  image: string;
  bg: string;
  bg_deep: string;
  accent: string;
  tagline: string;
};

type SupabaseProductSize = {
  product_id: string;
  size: Size;
  stock: number;
};

// Cache pour les stocks
let stockCache: Map<string, Record<Size, number>> | null = null;

async function loadStocks(): Promise<Map<string, Record<Size, number>>> {
  if (stockCache) return stockCache;
  
  const { data, error } = await supabase
    .from('product_sizes')
    .select('product_id, size, stock');
  
  if (error) throw error;
  
  const stockMap = new Map<string, Record<Size, number>>();
  (data as SupabaseProductSize[]).forEach((item) => {
    if (!stockMap.has(item.product_id)) {
      stockMap.set(item.product_id, { S: 0, M: 0, L: 0, XL: 0 });
    }
    const sizes = stockMap.get(item.product_id)!;
    sizes[item.size] = item.stock;
  });
  
  stockCache = stockMap;
  return stockMap;
}

function transformSupabaseProduct(item: SupabaseProduct, stocks: Record<Size, number>): Product {
  return {
    id: item.id,
    color: item.color,
    name: item.name,
    subtitle: item.tagline, // Utilise tagline comme subtitle
    description: item.description,
    price: item.price,
    oldPrice: item.old_price,
    image: item.image,
    theme: {
      bg: item.bg,
      bgDeep: item.bg_deep,
      accent: item.accent,
    },
    sizes: stocks,
    tagline: item.tagline,
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const [productsResult, stocksMap] = await Promise.all([
      supabase.from('products').select('*'),
      loadStocks()
    ]);
    
    console.log('🔍 Supabase products result:', productsResult);
    console.log('🔍 Supabase products error:', productsResult.error);
    console.log('🔍 Supabase products data:', productsResult.data);
    console.log('🔍 Stocks map:', stocksMap);
    
    if (productsResult.error) throw productsResult.error;
    
    if (productsResult.data && productsResult.data.length > 0) {
      console.log(`✅ Chargé ${productsResult.data.length} produits depuis Supabase`);
      return (productsResult.data as SupabaseProduct[]).map(product => 
        transformSupabaseProduct(product, stocksMap.get(product.id) || { S: 0, M: 0, L: 0, XL: 0 })
      );
    }
  } catch (error) {
    console.error('❌ Erreur Supabase getProducts:', error);
  }
  
  console.log('📦 Fallback sur les données locales');
  return localProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const [productResult, stocksMap] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      loadStocks()
    ]);
    
    if (productResult.error) throw productResult.error;
    
    if (productResult.data) {
      return transformSupabaseProduct(
        productResult.data as SupabaseProduct, 
        stocksMap.get(id) || { S: 0, M: 0, L: 0, XL: 0 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur Supabase pour produit', id, error);
  }
  
  return localProducts.find(p => p.id === id) || null;
}