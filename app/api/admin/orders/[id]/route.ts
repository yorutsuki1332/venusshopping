import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withDb } from "@/lib/db";
import type { PaymentStatus } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

const statuses: PaymentStatus[] = ["unpaid", "reported", "paid"];

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { paymentStatus?: string } | null;
  const paymentStatus = body?.paymentStatus;
  if (!paymentStatus || !statuses.includes(paymentStatus as PaymentStatus)) {
    return NextResponse.json({ error: "請選擇入帳狀態" }, { status: 400 });
  }

  const result = await withDb((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) return { error: "找不到這筆跟團", status: 404 as const };
    const now = new Date().toISOString();
    order.paymentMethod = "fps";
    order.paymentStatus = paymentStatus as PaymentStatus;
    if (paymentStatus === "paid") {
      order.paidAt = now;
    } else {
      order.paidAt = null;
    }
    if (paymentStatus === "unpaid") order.reportedAt = null;
    if (paymentStatus === "reported" && !order.reportedAt) order.reportedAt = now;
    return { ok: true as const };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidatePath(`/order/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
