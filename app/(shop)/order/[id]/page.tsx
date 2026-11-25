import Link from "next/link";
import { notFound } from "next/navigation";
import { FpsPanel } from "@/components/shop/FpsPanel";
import { readDb } from "@/lib/db";
import { formatTaipei, ntd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDb();
  const order = db.orders.find((item) => item.id === id);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <div className="rounded-hero border border-line bg-paper p-7 text-center shadow-card">
        <p className="text-xs font-semibold tracking-wider text-sage">FPS PAYMENT</p>
        <h1 className="font-serif-tc mt-2 text-2xl font-bold text-ink">跟團已建立，請用轉數快付款</h1>
        <p className="mt-2 text-sm text-mist">{order.name}，這筆只收轉數快。入帳後店家會用 {order.phone} 通知出貨。</p>
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
        <FpsPanel
          orderId={order.id}
          total={order.total}
          fpsId={db.settings.fpsId}
          fpsName={db.settings.fpsName}
          paymentStatus={order.paymentStatus}
        />
        <Link href="/" className="mt-6 inline-block text-sm text-sage-ink underline">
          回到選物團
        </Link>
      </div>
    </main>
  );
}
