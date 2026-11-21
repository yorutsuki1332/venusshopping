import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = readDb().products.find((item) => item.id === id);
  if (!product) notFound();

  return (
    <main className="space-y-4">
      <Link href="/admin/products" className="text-xs text-pebble underline">
        回到清單
      </Link>
      <ProductEditor product={product} />
    </main>
  );
}
