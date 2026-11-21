import { NextResponse } from "next/server";
import { assignImages } from "@/lib/assign-images";
import { newId, withDb } from "@/lib/db";
import { saveImageFiles } from "@/lib/media";
import { parseWhatsAppCatalog } from "@/lib/parser";
import type { Product } from "@/lib/types";

const SAMPLE = `【開團】雲朵褶皺純素皮革腋下包（補貨團）
品牌：MARHEN STYLE
原價：1690
團購價：1290（2件 1190／3件 1120）
規格：拿鐵奶杏、焦糖可可、極簡霧黑
說明：輕量僅 240g，可放入長夾與折疊傘。
備註：本團限定色
心得：背起來很輕，褶皺很有韓系鬆弛感。

---

【開團】晨露鼠尾草護手霜 50ml
品牌：NONFICTION INSPIRED
原價：680
團購價：520（2條 480）
規格：晨露鼠尾草、無花果白麝香
說明：吸收快、不黏膩，包包裡隨時補擦。
備註：滿兩條贈小樣`;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let sender = "WhatsApp";
  let text = "";
  let files: File[] = [];

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      sender?: string;
      text?: string;
      demo?: boolean;
    } | null;
    if (body?.demo) {
      sender = "示範對話";
      text = SAMPLE;
    } else {
      sender = body?.sender?.trim() || "WhatsApp";
      text = body?.text?.trim() || "";
    }
  } else {
    const form = await request.formData();
    sender = String(form.get("sender") ?? "WhatsApp").trim() || "WhatsApp";
    text = String(form.get("text") ?? "").trim();
    files = form
      .getAll("images")
      .filter((item): item is File => item instanceof File && item.size > 0);
  }

  if (!text) {
    return NextResponse.json({ error: "請貼上 WhatsApp 文字" }, { status: 400 });
  }
  if (files.length > 8) {
    return NextResponse.json({ error: "一次最多 8 張圖片" }, { status: 400 });
  }

  let images: string[] = [];
  try {
    images = await saveImageFiles(files);
  } catch (error) {
    const message = error instanceof Error ? error.message : "圖片無法儲存";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const drafts = parseWhatsAppCatalog(text);
  const receivedAt = new Date().toISOString();

  const { buckets, note } = assignImages(drafts.length, images);
  const products = await withDb((db) => {
    const created: Product[] = drafts.map((draft, index) => {
      const product: Product = {
        id: newId("p"),
        status: "pending",
        brand: draft.brand,
        title: draft.title,
        subtitle: draft.subtitle,
        description: draft.description,
        badge: draft.badge,
        quote: draft.quote,
        cutoff: draft.cutoff,
        arrival: draft.arrival,
        unit: draft.unit,
        origPrice: draft.origPrice,
        tiers: draft.tiers,
        specs: draft.specs,
        images: buckets[index] ?? [],
        joined: 0,
        source: {
          channel: "whatsapp",
          sender,
          text: draft.raw,
          receivedAt,
        },
        createdAt: receivedAt,
        updatedAt: receivedAt,
        publishedAt: null,
      };
      return product;
    });
    db.products = [...created, ...db.products];
    return created;
  });

  return NextResponse.json({
    ok: true,
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      images: product.images.length,
    })),
    imageNote: note,
  });
}
