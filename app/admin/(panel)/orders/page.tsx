import { OrderActions } from "@/components/admin/OrderActions";
import { readDb } from "@/lib/db";
import { formatTaipei, ntd } from "@/lib/pricing";
import type { PaymentStatus } from "@/lib/types";

const statusLabel: Record<PaymentStatus, string> = {
  unpaid: "未轉帳",
  reported: "顧客說已轉帳",
  paid: "已入帳",
};

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  const orders = readDb().orders;

  return (
    <main className="space-y-4">
      <h1 className="font-serif-tc text-3xl font-bold text-ink">跟團訂單</h1>
      <p className="text-sm text-mist">付款只有轉數快。顧客按過「我已轉帳」後，核對銀行入帳再按確認。</p>
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
            <p className="mt-2 font-bold">
              {ntd(order.total)}
              <span className="ml-2 text-xs font-semibold text-sage-ink">轉數快・{statusLabel[order.paymentStatus]}</span>
            </p>
            <p className="mt-1 text-caption text-pebble">訂單編號 {order.id}</p>
            <OrderActions orderId={order.id} paymentStatus={order.paymentStatus} />
          </li>
        ))}
      </ul>
    </main>
  );
}
