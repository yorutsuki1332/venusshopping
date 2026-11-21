import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { newId, withDb } from "@/lib/db";
import { tierFor } from "@/lib/pricing";
import type { Order, OrderItem } from "@/lib/types";

type Incoming = {
  name?: string;
  phone?: string;
  contact?: string;
  note?: string;
  items?: { productId?: string; spec?: string; qty?: number }[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Incoming | null;
  const name = body?.name?.trim() ?? "";
  const phone = body?.phone?.trim() ?? "";
  const contact = body?.contact?.trim() ?? "";
  const note = body?.note?.trim() ?? "";
  const incoming = Array.isArray(body?.items) ? body.items : [];

  if (name.length < 2) {
    return NextResponse.json({ error: "請填寫跟團姓名" }, { status: 400 });
  }
  if (!/^09\d{8}$/.test(phone) && !/^\+?\d{8,15}$/.test(phone)) {
    return NextResponse.json({ error: "請填寫可聯絡的手機號碼" }, { status: 400 });
  }
  if (!incoming.length) {
    return NextResponse.json({ error: "跟團清單是空的" }, { status: 400 });
  }

  const result = await withDb((db) => {
    const resolved: { product: (typeof db.products)[number]; spec: string; qty: number; unitPrice: number }[] = [];
    for (const row of incoming) {
      const qty = Math.max(1, Math.min(99, Math.round(Number(row.qty) || 0)));
      const product = db.products.find((item) => item.id === row.productId && item.status === "published");
      if (!product) return { error: "有商品已下架或尚未正式上架，請回清單確認" } as const;
      const tier = tierFor(product.tiers, qty);
      if (!tier) return { error: `「${product.title}」尚未設定價格` } as const;
      resolved.push({
        product,
        spec: product.specs.includes(String(row.spec)) ? String(row.spec) : product.specs[0],
        qty,
        unitPrice: tier.price,
      });
    }

    const items: OrderItem[] = resolved.map((row) => {
      row.product.joined += row.qty;
      return {
        productId: row.product.id,
        title: row.product.title,
        spec: row.spec,
        qty: row.qty,
        unitPrice: row.unitPrice,
        image: row.product.images[0] ?? "",
      };
    });

    const order: Order = {
      id: newId("o"),
      name,
      phone,
      contact,
      note,
      items,
      total: items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(order);
    return { order } as const;
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/");
  revalidatePath("/admin/orders");
  return NextResponse.json({ ok: true, id: result.order.id });
}
