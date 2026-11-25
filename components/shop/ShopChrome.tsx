"use client";

import Link from "next/link";
import { ntd } from "@/lib/pricing";
import { Countdown } from "./Countdown";
import { useCart } from "./CartProvider";

export function ShopChrome({
  brand,
  endsAt,
  giftThreshold,
  giftLabel,
  children,
}: {
  brand: string;
  endsAt: string;
  giftThreshold: number;
  giftLabel: string;
  children: React.ReactNode;
}) {
  const { lines, count, total, drawerOpen, openDrawer, closeDrawer, removeLine } = useCart();
  const remain = Math.max(0, giftThreshold - total);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hem bg-foam/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="font-serif-tc text-lg font-bold italic tracking-wide text-cocoa">
            {brand}
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-sand px-3.5 py-1.5 text-xs font-medium text-soil sm:flex">
              <span className="h-2 w-2 rounded-full bg-sage" />
              <span>
                首爾連線倒數 <Countdown endsAt={endsAt} />
              </span>
            </div>
            <button
              type="button"
              onClick={openDrawer}
              className="relative rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              跟團清單
              <span className="ml-1.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose px-1 text-micro">
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-hem px-5 py-8 text-center text-xs text-pebble">
        預訂團購・店家確認商品後才正式上架・付款只收轉數快 FPS
      </footer>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={closeDrawer}>
          <aside
            className="flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-seam px-5 py-4">
              <h2 className="font-serif-tc text-lg font-bold">我的跟團清單</h2>
              <button type="button" onClick={closeDrawer} className="text-sm text-stone">
                關閉
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="py-16 text-center text-sm text-dust">目前還沒有跟團商品。</p>
              ) : (
                lines.map((line) => (
                  <div key={line.key} className="flex gap-3 rounded-2xl border border-line bg-white p-3">
                    {line.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-sand" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-ink">{line.title}</h3>
                      <p className="mt-0.5 text-caption text-stone">規格：{line.spec}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-cocoa">
                          {ntd(line.unitPrice)} × {line.qty}
                        </span>
                        <button type="button" onClick={() => removeLine(line.key)} className="text-caption text-dust underline">
                          移除
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-seam px-5 py-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-mist">預訂合計</span>
                <span className="text-xl font-bold">{ntd(total)}</span>
              </div>
              <p className="mb-3 text-caption text-sage">
                {total >= giftThreshold ? `已達${giftLabel}` : remain > 0 && total > 0 ? `再湊 ${ntd(remain)}，${giftLabel}` : giftLabel}
              </p>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className={`block rounded-2xl py-3 text-center text-sm font-semibold text-white ${
                  lines.length ? "bg-sage hover:bg-sage-deep" : "pointer-events-none bg-mute"
                }`}
              >
                前往跟團登記
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
