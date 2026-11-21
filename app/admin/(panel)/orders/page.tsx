import { readDb } from "@/lib/db";
import { formatTaipei, ntd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  const orders = readDb().orders;

  return (
    <main className="space-y-4">
      <h1 className="font-serif-tc text-3xl font-bold text-ink">預訂單</h1>
      {orders.length === 0 ? <p className="text-sm text-pebble">還沒有人跟團。</p> : null}
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-3xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">{order.name}</h2>
              <span className="text-xs text-pebble">{formatTaipei(order.createdAt)}</span>
            </div>
            <p className="mt-1 text-xs text-mist">
              {order.phone}
              {order.contact ? ` ・ ${order.contact}` : ""}
              {order.note ? ` ・ ${order.note}` : ""}
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {order.items.map((item, index) => (
                <li key={`${item.productId}-${index}`}>
                  {item.title} ・ {item.spec} × {item.qty} ・ {ntd(item.unitPrice * item.qty)}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-bold">{ntd(order.total)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
