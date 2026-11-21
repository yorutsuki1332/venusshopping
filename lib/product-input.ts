import type { Product, Tier } from "./types";

export type ProductDraft = {
  brand: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  quote: string;
  cutoff: string;
  arrival: string;
  origPrice: number;
  tiers: Tier[];
  specs: string[];
};

function asNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function sanitizeDraft(input: Partial<ProductDraft>): ProductDraft {
  const tiers = (Array.isArray(input.tiers) ? input.tiers : [])
    .map((tier) => ({
      min: Math.max(1, asNumber(tier?.min)),
      price: Math.max(0, asNumber(tier?.price)),
      label: String(tier?.label ?? "").trim() || "團購價",
    }))
    .filter((tier) => tier.price > 0)
    .sort((a, b) => a.min - b.min);

  const unique = new Map<number, Tier>();
  for (const tier of tiers) unique.set(tier.min, tier);

  const specs = (Array.isArray(input.specs) ? input.specs : [])
    .map((spec) => String(spec).trim())
    .filter(Boolean);

  return {
    brand: String(input.brand ?? "").trim() || "WhatsApp 團購選品",
    title: String(input.title ?? "").trim(),
    subtitle: String(input.subtitle ?? "").trim(),
    description: String(input.description ?? "").trim(),
    badge: String(input.badge ?? "").trim() || "團購進行中",
    quote: String(input.quote ?? "").trim(),
    cutoff: String(input.cutoff ?? "").trim(),
    arrival: String(input.arrival ?? "").trim(),
    origPrice: Math.max(0, asNumber(input.origPrice)),
    tiers: [...unique.values()],
    specs: specs.length ? specs : ["均碼"],
  };
}

export function applyDraft(product: Product, draft: ProductDraft) {
  product.brand = draft.brand;
  product.title = draft.title;
  product.subtitle = draft.subtitle;
  product.description = draft.description;
  product.badge = draft.badge;
  product.quote = draft.quote;
  product.cutoff = draft.cutoff;
  product.arrival = draft.arrival;
  product.origPrice = draft.origPrice;
  product.tiers = draft.tiers;
  product.specs = draft.specs;
  product.unit = draft.tiers[0]?.label.replace(/^\d+/, "").replace(/起$/, "") || product.unit;
  product.updatedAt = new Date().toISOString();
}

export function publishProblems(product: Product) {
  const problems: string[] = [];
  if (!product.title) problems.push("請填寫商品名稱");
  if (!product.tiers.length || product.tiers[0].price <= 0) problems.push("請至少設定一個團購價");
  if (!product.images.length) problems.push("請至少上傳一張商品圖片");
  if (!product.specs.length) problems.push("請至少保留一個規格");
  return problems;
}
