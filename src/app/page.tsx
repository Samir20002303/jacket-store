import { ImmersiveHome } from "@/src/components/immersive/immersive-home";
import { getProducts } from "@/src/lib/actions/products";
export default async function Home() {
  const products = await getProducts();
  return <ImmersiveHome products={products} />;
}