import { ImmersiveHome } from "@/src/components/immersive-home";
import { getProducts } from "@/src/data/products";

export default async function Home() {
  const products = await getProducts();
  return <ImmersiveHome products={products} />;
}