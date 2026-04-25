import { notFound } from "next/navigation";
import { ImmersiveHome } from "@/src/components/immersive-home";
import { products } from "@/src/data/products";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const exists = products.some((product) => product.id === id);

  if (!exists) {
    notFound();
  }

  return <ImmersiveHome initialProductId={id} />;
}
