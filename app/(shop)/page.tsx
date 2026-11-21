import { Lookbook } from "@/components/shop/Lookbook";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = readDb();
  const products = db.products.filter((product) => product.status === "published");

  return (
    <main>
      <section className="mx-auto max-w-5xl px-5 pt-7 pb-4">
        <div className="grid items-center gap-8 rounded-hero bg-sand p-6 shadow-card sm:p-9 md:grid-cols-12">
          <div className="space-y-4 md:col-span-6">
            <span className="inline-block rounded-full bg-sage/20 px-3.5 py-1 text-xs font-semibold text-sage-ink">
              ✿ SEOUL CURATION ・ 閨蜜湊單 75 折
            </span>
            <h1 className="font-serif-tc text-2xl leading-snug font-bold text-ink sm:text-3xl">
              {db.settings.heroTitle}
            </h1>
            <p className="text-sm leading-relaxed text-mist">{db.settings.heroSubtitle}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {db.settings.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/80 px-3 py-1 text-xs text-clay">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-6">
            <div className="rounded-3xl bg-white p-2.5 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={db.settings.heroImage}
                alt="韓系穿搭選物"
                className="h-64 w-full rounded-photo object-cover sm:h-72"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="lookbook" className="mx-auto max-w-5xl px-5 py-8">
        <div className="mx-auto mb-8 max-w-md text-center">
          <h2 className="font-serif-tc text-2xl font-bold text-ink">Lookbook & 團購選品清單</h2>
          <p className="mt-1.5 text-xs text-stone">任選兩件享閨蜜組合價，{db.settings.giftLabel}</p>
        </div>
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-shell bg-paper px-6 py-16 text-center text-sm text-stone">
            本期選品還在店家後台確認，正式上架後就會出現在這裡。
          </div>
        ) : (
          <Lookbook products={products} />
        )}
      </section>

      <section id="guide" className="mx-auto grid max-w-5xl gap-4 px-5 pb-12 md:grid-cols-3">
        {[
          ["01 收件", "WhatsApp 的圖片與文字先在伺服器整理成待上架，不會直接出現在前台。"],
          ["02 確認", "店家核對品名、階梯價、規格與實品照，確認無誤才按正式上架。"],
          ["03 跟團", "你現在看到的都是已上架商品。下單是預訂登記，截團後再通知付款。"],
        ].map(([title, body]) => (
          <div key={title} className="rounded-3xl border border-line bg-paper p-5">
            <h3 className="font-serif-tc text-base font-bold text-ink">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-mist">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
