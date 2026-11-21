import Link from "next/link";
import { IngestNotice } from "./ingest-notice";
import { readDb } from "@/lib/db";
import { formatTaipei, ntd, tierFor } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status === "published" || status === "all" ? status : "pending";
  const products = readDb().products.filter((product) => (filter === "all" ? true : product.status === filter));

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif-tc text-3xl font-bold text-ink">商品審核</h1>
        <div className="flex gap-2 text-xs font-semibold">
          {[
            ["pending", "待上架"],
            ["published", "已上架"],
            ["all", "全部"],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/products?status=${key}`}
              className={`rounded-full px-3 py-1.5 ${filter === key ? "bg-ink text-white" : "bg-sand"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <IngestNotice />
      {products.length === 0 ? <p className="text-sm text-pebble">這個狀態目前沒有商品。</p> : null}
      <ul className="grid gap-3">
        {products.map((product) => {
          const price = tierFor(product.tiers, 1)?.price ?? 0;
          return (
            <li key={product.id}>
              <Link href={`/admin/products/${product.id}`} className="flex gap-4 rounded-3xl border border-line bg-paper p-3">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sand text-micro text-pebble">無圖</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-semibold text-sage">{product.brand}</p>
                  <h2 className="truncate font-bold">{product.title}</h2>
                  <p className="mt-1 text-xs text-stone">
                    {product.status === "published" ? "已上架" : "待上架"}
                    {product.images.length === 0 ? " ・ 缺圖" : ""} ・ {price ? ntd(price) : "未定價"} ・ {formatTaipei(product.updatedAt)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
