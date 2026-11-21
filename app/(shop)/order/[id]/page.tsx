import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { formatTaipei, ntd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = readDb().orders.find((item) => item.id === id);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <div className="rounded-hero border border-line bg-paper p-7 text-center shadow-card">
        <p className="text-xs font-semibold tracking-wider text-sage">PREORDER RECEIVED</p>
        <h1 className="font-serif-tc mt-2 text-2xl font-bold text-ink">跟團登記已收到</h1>
        <p className="mt-2 text-sm text-mist">
          {order.name}，我們會在截團後用 {order.phone} 通知付款與出貨。這筆是預訂，尚未扣款。
        </p>
        <p className="mt-4 text-xs text-dust">{formatTaipei(order.createdAt)}</p>
        <ul className="mt-6 space-y-2 text-left text-sm">
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="flex justify-between gap-3 border-b border-seam py-2">
              <span>
                {item.title}
                <span className="block text-xs text-pebble">
                  {item.spec} × {item.qty}
                </span>
              </span>
              <span>{ntd(item.unitPrice * item.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xl font-bold">{ntd(order.total)}</p>
        <Link href="/" className="mt-6 inline-block text-sm text-sage-ink underline">
          回到選物團
        </Link>
      </div>
    </main>
  );
}
