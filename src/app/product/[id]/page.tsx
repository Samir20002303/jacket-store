import { notFound } from "next/navigation";
import { ImmersiveHome } from "@/src/components/immersive/immersive-home";
import { getProductById, getProducts } from "@/src/lib/actions/products";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  const allproducts = await getProducts();

  if (!product) {
    notFound();
  }

  return <ImmersiveHome products={allproducts} initialProductId={id} />;
}