import Link from "next/link";
import { readDb } from "@/lib/db";
import { formatTaipei } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  const db = readDb();
  const pending = db.products.filter((product) => product.status === "pending");
  const published = db.products.filter((product) => product.status === "published");

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-serif-tc text-3xl font-bold text-ink">待上架，確認後才給顧客看到</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
          WhatsApp 的圖文先進入後台。每一項都停在待上架，你核對品名、價格、規格和照片，按下正式上架，前台選物團才會出現。
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["待上架", String(pending.length), "/admin/products?status=pending"],
          ["已上架", String(published.length), "/admin/products?status=published"],
          ["預訂單", String(db.orders.length), "/admin/orders"],
        ].map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-3xl border border-line bg-paper p-5">
            <p className="text-xs text-pebble">{label}</p>
            <p className="font-serif-tc mt-1 text-3xl font-bold">{value}</p>
          </Link>
        ))}
      </section>
      <section className="rounded-3xl border border-line bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif-tc text-lg font-bold">最新待確認</h2>
          <Link href="/admin/inbox" className="text-xs font-semibold text-sage-ink">
            去收 WhatsApp
          </Link>
        </div>
        {pending.length === 0 ? <p className="text-sm text-pebble">目前沒有待上架商品。</p> : null}
        <ul className="space-y-2">
          {pending.slice(0, 5).map((product) => (
            <li key={product.id}>
              <Link href={`/admin/products/${product.id}`} className="flex items-center justify-between rounded-2xl bg-cream px-3 py-3 text-sm">
                <span className="font-semibold">{product.title}</span>
                <span className="text-xs text-pebble">{formatTaipei(product.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
