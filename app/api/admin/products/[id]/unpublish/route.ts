import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withDb } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { id } = await context.params;
  const found = await withDb((db) => {
    const product = db.products.find((item) => item.id === id);
    if (!product) return false;
    product.status = "pending";
    product.updatedAt = new Date().toISOString();
    return true;
  });
  if (!found) return NextResponse.json({ error: "找不到商品" }, { status: 404 });
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${id}`);
  return NextResponse.json({ ok: true });
}
