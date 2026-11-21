"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { ntd, tierFor } from "@/lib/pricing";
import { useCart } from "./CartProvider";

export function JoinPanel({ product, onDone }: { product: Product; onDone?: () => void }) {
  const { addItem } = useCart();
  const [spec, setSpec] = useState(product.specs[0] ?? "均碼");
  const [qty, setQty] = useState(1);
  const tier = useMemo(() => tierFor(product.tiers, qty), [product.tiers, qty]);
  const unit = tier?.price ?? 0;
  const total = unit * qty;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wider text-sage">{product.brand}</p>
        <h3 className="font-serif-tc mt-1 text-xl font-bold text-ink">{product.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-mist">{product.subtitle}</p>
        {product.cutoff || product.arrival ? (
          <p className="mt-2 text-xs text-sage-ink">
            {[product.cutoff ? `${product.cutoff}截單` : "", product.arrival].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs text-stone">規格</p>
        <div className="flex flex-wrap gap-2">
          {product.specs.map((item) => {
            const active = item === spec;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setSpec(item)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-hem bg-white text-cocoa hover:border-taupe"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-stone">
          <span>階梯團購價</span>
          <span>目前套用：{tier?.label ?? "尚未定價"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {product.tiers.map((item) => {
            const active = item.min === tier?.min;
            return (
              <div
                key={`${item.min}-${item.price}`}
                className={`rounded-2xl border px-2 py-2 text-center ${
                  active
                    ? "border-sage bg-sage text-white"
                    : "border-hem bg-white text-mist"
                }`}
              >
                <div className="text-micro">{item.label}</div>
                <div className="mt-0.5 text-sm font-bold">{ntd(item.price)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-stone">數量</span>
        <div className="flex items-center gap-3 rounded-full bg-biscuit px-2 py-1">
          <button type="button" className="h-8 w-8 rounded-full bg-white" onClick={() => setQty((n) => Math.max(1, n - 1))}>
            −
          </button>
          <span className="w-6 text-center text-sm font-bold">{qty}</span>
          <button type="button" className="h-8 w-8 rounded-full bg-white" onClick={() => setQty((n) => Math.min(99, n + 1))}>
            +
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-seam pt-4">
        <div>
          {product.origPrice > unit ? (
            <p className="text-xs text-dust line-through">原價總計 {ntd(product.origPrice * qty)}</p>
          ) : null}
          <p className="text-2xl font-bold text-bark">{ntd(total)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            addItem({
              productId: product.id,
              title: product.title,
              spec,
              qty,
              origPrice: product.origPrice,
              image: product.images[0] ?? "",
              tiers: product.tiers,
            });
            onDone?.();
          }}
          className="rounded-2xl bg-sage px-4 py-3 text-xs font-semibold tracking-wider text-white shadow-sm transition hover:bg-sage-deep"
        >
          加入我的質感跟團車
        </button>
      </div>
    </div>
  );
}
