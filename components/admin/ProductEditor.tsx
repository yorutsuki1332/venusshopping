"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Tier } from "@/lib/types";
import { formatTaipei } from "@/lib/pricing";

type Editable = {
  brand: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  quote: string;
  cutoff: string;
  arrival: string;
  origPrice: string;
  specs: string;
  tiers: Tier[];
};

function toEditable(product: Product): Editable {
  return {
    brand: product.brand,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    badge: product.badge,
    quote: product.quote,
    cutoff: product.cutoff,
    arrival: product.arrival,
    origPrice: String(product.origPrice || ""),
    specs: product.specs.join("、"),
    tiers: product.tiers.length ? product.tiers : [{ min: 1, label: "1 件團購價", price: 0 }],
  };
}

export function ProductEditor({ product }: { product: Product }) {
  const router = useRouter();
  const [form, setForm] = useState<Editable>(() => toEditable(product));
  const [images, setImages] = useState(product.images);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function payload() {
    return {
      brand: form.brand,
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      badge: form.badge,
      quote: form.quote,
      cutoff: form.cutoff,
      arrival: form.arrival,
      origPrice: Number(form.origPrice) || 0,
      specs: form.specs.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
      tiers: form.tiers,
    };
  }

  async function send(url: string, method = "POST") {
    setPending(true);
    setError("");
    setMessage("");
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" && url.endsWith("/unpublish") ? undefined : JSON.stringify(payload()),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "沒有儲存成功");
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form
        className="space-y-4 rounded-3xl border border-line bg-paper p-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-serif-tc text-2xl font-bold text-ink">審核商品</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.status === "published" ? "bg-sage/20 text-moss" : "bg-wheat text-bronze"}`}>
            {product.status === "published" ? "已上架" : "待上架"}
          </span>
        </div>
        <Field label="品牌" value={form.brand} onChange={(brand) => setForm({ ...form, brand })} />
        <Field label="商品名稱" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <label className="block text-sm">
          說明
          <textarea value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} rows={3} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="徽章文字" value={form.badge} onChange={(badge) => setForm({ ...form, badge })} />
          <Field label="原價" value={form.origPrice} onChange={(origPrice) => setForm({ ...form, origPrice })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="截單日" value={form.cutoff} onChange={(cutoff) => setForm({ ...form, cutoff })} />
          <Field label="到貨" value={form.arrival} onChange={(arrival) => setForm({ ...form, arrival })} />
        </div>
        <label className="block text-sm">
          團購說明
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={8} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" />
        </label>
        <Field label="開箱短評" value={form.quote} onChange={(quote) => setForm({ ...form, quote })} />
        <Field label="規格（用頓號分開）" value={form.specs} onChange={(specs) => setForm({ ...form, specs })} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm">階梯價</p>
            <button
              type="button"
              className="text-xs text-sage-ink"
              onClick={() => setForm({ ...form, tiers: [...form.tiers, { min: form.tiers.length + 1, label: "優惠", price: 0 }] })}
            >
              加一階
            </button>
          </div>
          {form.tiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-[72px_1fr_96px_auto] gap-2">
              <input
                type="number"
                min={1}
                value={tier.min}
                onChange={(event) => {
                  const tiers = [...form.tiers];
                  tiers[index] = { ...tier, min: Number(event.target.value) };
                  setForm({ ...form, tiers });
                }}
                className="rounded-xl border border-hem bg-white px-2 py-2 text-sm"
              />
              <input
                value={tier.label}
                onChange={(event) => {
                  const tiers = [...form.tiers];
                  tiers[index] = { ...tier, label: event.target.value };
                  setForm({ ...form, tiers });
                }}
                className="rounded-xl border border-hem bg-white px-2 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                value={tier.price}
                onChange={(event) => {
                  const tiers = [...form.tiers];
                  tiers[index] = { ...tier, price: Number(event.target.value) };
                  setForm({ ...form, tiers });
                }}
                className="rounded-xl border border-hem bg-white px-2 py-2 text-sm"
              />
              <button
                type="button"
                className="text-xs text-dust"
                onClick={() => setForm({ ...form, tiers: form.tiers.filter((_, item) => item !== index) })}
              >
                移除
              </button>
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-sage-ink">{message}</p> : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={pending}
            className="rounded-2xl bg-sand px-4 py-3 text-sm font-semibold"
            onClick={async () => {
              const ok = await send(`/api/admin/products/${product.id}`, "PUT");
              if (ok) setMessage("已儲存，仍維持目前狀態");
            }}
          >
            只儲存
          </button>
          {product.status === "pending" ? (
            <button
              type="button"
              disabled={pending}
              className="rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-white"
              onClick={async () => {
                const ok = await send(`/api/admin/products/${product.id}/publish`);
                if (ok) setMessage("已正式上架，顧客現在可以跟團");
              }}
            >
              確認無誤，正式上架
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
              onClick={async () => {
                const ok = await send(`/api/admin/products/${product.id}/unpublish`);
                if (ok) setMessage("已退回待上架，前台不再顯示");
              }}
            >
              退回待上架
            </button>
          )}
        </div>
      </form>

      <aside className="space-y-4">
        <section className="rounded-3xl border border-line bg-white p-4">
          <h2 className="text-sm font-bold">商品圖片</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {images.length === 0 ? <p className="col-span-2 text-xs text-pebble">還沒有圖片，正式上架前需要至少一張。</p> : null}
            {images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="h-28 w-full rounded-2xl object-cover" />
            ))}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="mt-3 block w-full text-xs"
            onChange={async (event) => {
              const selected = [...(event.target.files ?? [])];
              if (!selected.length) return;
              const body = new FormData();
              selected.forEach((file) => body.append("images", file));
              setPending(true);
              setError("");
              const response = await fetch(`/api/admin/products/${product.id}/images`, { method: "POST", body });
              const data = (await response.json()) as { images?: string[]; error?: string };
              setPending(false);
              if (!response.ok) {
                setError(data.error || "圖片上傳失敗");
                return;
              }
              setImages(data.images ?? images);
              event.target.value = "";
              router.refresh();
            }}
          />
        </section>
        <section className="rounded-3xl bg-sand p-4">
          <h2 className="text-sm font-bold">原始 WhatsApp 文字</h2>
          <p className="mt-1 text-caption text-stone">
            {product.source.sender} ・ {formatTaipei(product.source.receivedAt)}
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-paper p-3 text-xs leading-relaxed text-bark">
            {product.source.text || "這筆是預設上架商品，沒有原始訊息。"}
          </pre>
        </section>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" />
    </label>
  );
}
