import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withDb } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { id } = await context.params;
  const result = await withDb((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) return { error: "找不到這筆跟團", status: 404 as const };
    if (order.paymentStatus === "paid") return { error: "這筆已經確認入帳", status: 400 as const };
    order.paymentMethod = "fps";
    order.paymentStatus = "reported";
    order.reportedAt = new Date().toISOString();
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
