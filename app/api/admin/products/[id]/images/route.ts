import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withDb } from "@/lib/db";
import { saveImageFiles } from "@/lib/media";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const form = await request.formData();
  const files = form
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (!files.length) {
    return NextResponse.json({ error: "請選擇圖片" }, { status: 400 });
  }
  if (files.length > 8) {
    return NextResponse.json({ error: "一次最多 8 張圖片" }, { status: 400 });
  }

  let urls: string[] = [];
  try {
    urls = await saveImageFiles(files);
  } catch (error) {
    const message = error instanceof Error ? error.message : "圖片無法儲存";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const product = await withDb((db) => {
    const current = db.products.find((item) => item.id === id);
    if (!current) return null;
    current.images.push(...urls);
    current.updatedAt = new Date().toISOString();
    return current;
  });

  if (!product) return NextResponse.json({ error: "找不到商品" }, { status: 404 });
  revalidatePath("/");
  revalidatePath(`/admin/products/${id}`);
  return NextResponse.json({ ok: true, images: product.images });
}
