import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinPanel } from "@/components/shop/JoinPanel";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = readDb().products.find((item) => item.id === id && item.status === "published");
  if (!product) notFound();

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-5 py-8 md:grid-cols-2">
      <div className="rounded-3xl bg-white p-2.5 shadow-md">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.title} className="h-frame w-full rounded-photo object-cover" />
        ) : (
          <div className="flex h-frame items-center justify-center rounded-photo bg-sand">尚無圖片</div>
        )}
      </div>
      <div className="rounded-3xl border border-line bg-paper p-6">
        <JoinPanel product={product} />
        <Link href="/" className="mt-4 inline-block text-xs text-pebble underline">
          回到選品清單
        </Link>
      </div>
      {product.description && product.description !== product.subtitle ? (
        <article className="rounded-3xl border border-line bg-paper p-6 md:col-span-2">
          <h2 className="font-serif-tc text-lg font-bold text-ink">團購說明</h2>
          <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-bark">{product.description}</p>
        </article>
      ) : null}
    </main>
  );
}
