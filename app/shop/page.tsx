import { getProducts } from "@/src/data/products";
import { ShopProductCard } from "@/src/components/shop-product-card";
import { ShopFilters } from "@/src/components/shop-filters";
import { StandardPageShell } from "@/src/components/standard-page-shell";
import type { Product, Size } from "@/src/data/products";

type ShopPageProps = {
  searchParams: Promise<{ color?: string; size?: string; price?: string }>;
};

function filterProducts(products: Product[], filters: { color?: string; size?: string; price?: string }) {
  return products.filter((product) => {
    if (filters.color && product.color !== filters.color) return false;

    if (filters.size && !product.sizes[filters.size as keyof typeof product.sizes]) return false;

    if (filters.price && filters.price !== "all") {
      const [min, max] = filters.price.split("-").map(Number);
      if (max) {
        if (product.price < min || product.price > max) return false;
      } else {
        if (product.price < min) return false;
      }
    }

    return true;
  });
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = await getProducts();
  const params = await searchParams;
  const filteredProducts = filterProducts(products, params);

  return (
    <StandardPageShell
      title="Shop"
      description="Explore our full outerwear lineup crafted for premium comfort, strong silhouettes, and modern cold-weather layering."
    >
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit lg:sticky lg:top-8">
          <ShopFilters products={products} filteredProducts={filteredProducts} />
        </aside>

        <div>
          <p className="mb-4 text-sm text-black/50">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <p className="text-lg font-medium text-black/70">No products found</p>
              <p className="text-sm text-black/40">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ShopProductCard
                  key={product.id}
                  product={product}
                  selectedSize={params.size as Size | undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </StandardPageShell>
  );
}