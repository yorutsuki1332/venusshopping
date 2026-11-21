import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withDb } from "@/lib/db";
import { applyDraft, sanitizeDraft } from "@/lib/product-input";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const draft = sanitizeDraft(body ?? {});
  if (!draft.title) {
    return NextResponse.json({ error: "請填寫商品名稱" }, { status: 400 });
  }

  const updated = await withDb((db) => {
    const product = db.products.find((item) => item.id === id);
    if (!product) return null;
    applyDraft(product, draft);
    return product;
  });

  if (!updated) return NextResponse.json({ error: "找不到商品" }, { status: 404 });
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${id}`);
  return NextResponse.json({ ok: true, product: updated });
}
