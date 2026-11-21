import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withDb } from "@/lib/db";
import { applyDraft, publishProblems, sanitizeDraft } from "@/lib/product-input";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const draft = sanitizeDraft(body ?? {});

  const result = await withDb((db) => {
    const product = db.products.find((item) => item.id === id);
    if (!product) return { error: "找不到商品", status: 404 as const };
    applyDraft(product, draft);
    const problems = publishProblems(product);
    if (problems.length) return { error: problems.join("；"), status: 400 as const };
    product.status = "published";
    product.publishedAt = new Date().toISOString();
    return { product };
  });

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${id}`);
  return NextResponse.json({ ok: true });
}
