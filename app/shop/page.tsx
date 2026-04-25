import { products } from "@/src/data/products";
import { ShopProductCard } from "@/src/components/shop-product-card";
import { StandardPageShell } from "@/src/components/standard-page-shell";

export default function ShopPage() {
  return (
    <StandardPageShell
      title="Shop"
      description="Explore our full outerwear lineup crafted for premium comfort, strong silhouettes, and modern cold-weather layering."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>
    </StandardPageShell>
  );
}
