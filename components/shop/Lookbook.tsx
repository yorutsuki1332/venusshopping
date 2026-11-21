"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ntd, tierFor } from "@/lib/pricing";
import { JoinPanel } from "./JoinPanel";

export function Lookbook({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {products.map((product) => {
          const price = tierFor(product.tiers, 1)?.price ?? 0;
          return (
            <article
              key={product.id}
              className="flex flex-col justify-between rounded-3xl border border-line bg-paper p-4 shadow-lift transition duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="relative mb-4 overflow-hidden rounded-photo">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt={product.title} className="h-60 w-full object-cover" />
                  ) : (
                    <div className="flex h-60 items-center justify-center bg-sand text-sm text-pebble">尚無圖片</div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-caption font-semibold text-cocoa backdrop-blur-sm">
                    {product.badge}
                  </span>
                </div>
                <div className="space-y-2 px-1">
                  <p className="text-caption font-semibold tracking-wider text-sage">{product.brand}</p>
                  {product.arrival ? <p className="text-caption text-pebble">{product.arrival}</p> : null}
                  <h3 className="text-base leading-snug font-bold text-ink">
                    <Link href={`/product/${product.id}`}>{product.title}</Link>
                  </h3>
                  <p className="text-xs leading-relaxed text-ash">{product.subtitle}</p>
                  {product.quote ? (
                    <div className="mt-2 flex items-start gap-2 rounded-2xl bg-biscuit p-2.5 text-caption text-umber">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush text-micro font-bold text-white">
                        @
                      </span>
                      <span>「{product.quote}」</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 border-t border-seam px-1 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    {product.origPrice > price ? (
                      <span className="mr-1 text-xs text-dust line-through">{ntd(product.origPrice)}</span>
                    ) : null}
                    <span className="text-xl font-bold text-bark">{ntd(price)}</span>
                  </div>
                  <span className="rounded-full bg-sage/20 px-2.5 py-0.5 text-caption font-medium text-moss">
                    {product.joined} 人已跟團
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(product)}
                  className="w-full rounded-2xl bg-sage py-3 text-xs font-semibold tracking-wider text-white shadow-sm transition hover:bg-sage-deep"
                >
                  加入我的質感跟團車
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setActive(null)}>
          <div
            className="animate-fade-up max-h-sheet w-full max-w-lg overflow-y-auto rounded-3xl bg-paper shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-52 bg-sand">
              {active.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.images[0]} alt="" className="h-full w-full object-cover" />
              ) : null}
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white"
              >
                ×
              </button>
              <span className="absolute bottom-3 left-3 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                {active.badge}
              </span>
            </div>
            <div className="p-6">
              <JoinPanel product={active} onDone={() => setActive(null)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
