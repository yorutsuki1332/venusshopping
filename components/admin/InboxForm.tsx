"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseWhatsAppCatalog } from "@/lib/parser";
import { ntd } from "@/lib/pricing";

const SAMPLE = `紐西蘭 Ecostore 超敏感配方洗衣液 1L

建議零售價︰$75/支，2支或以上:$65/支

截：10月28日
🚚預計1月底到港🚚

👶🏻💙 屋企有BB、皮膚容易敏感嘅朋友仔
洗衫用品真係要揀得細心啲！

-規格︰1L

==⚠️ 聲明 ⚠️==
1.本貨品為平行進口正貨

✨✨✨

紐西蘭 Ecostore 超敏感配方洗衣液 1L

$75/支

✨✨✨
數量有限,售完即止,不作另行通知`;

export function InboxForm() {
  const router = useRouter();
  const [sender, setSender] = useState("團購群");
  const [text, setText] = useState(SAMPLE);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const drafts = useMemo(() => parseWhatsAppCatalog(text), [text]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="space-y-4 rounded-3xl border border-line bg-paper p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          setNote("");
          const form = new FormData();
          form.set("sender", sender);
          form.set("text", text);
          files.forEach((file) => form.append("images", file));
          const response = await fetch("/api/admin/ingest", { method: "POST", body: form });
          const data = (await response.json()) as {
            error?: string;
            imageNote?: string;
            products?: { id: string; title: string }[];
          };
          setPending(false);
          if (!response.ok) {
            setError(data.error || "上傳失敗");
            return;
          }
          const summary = `已建立 ${data.products?.length ?? 0} 項待上架，順序跟訊息一樣。`;
          sessionStorage.setItem("atelier-ingest-note", [summary, data.imageNote].filter(Boolean).join(""));
          setFiles([]);
          router.push("/admin/products?status=pending");
          router.refresh();
        }}
      >
        <h1 className="font-serif-tc text-2xl font-bold text-ink">WhatsApp 收件</h1>
        <p className="text-xs leading-relaxed text-mist">
          把群組裡的商品文字貼上，圖片一併選取。伺服器會拆出品名、價格與規格，存成待上架。這裡不會登入 WhatsApp，也不會讀取私人對話。
        </p>
        <label className="block text-sm">
          來源名稱
          <input value={sender} onChange={(event) => setSender(event.target.value)} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" />
        </label>
        <label className="block text-sm">
          訊息文字
          <textarea value={text} onChange={(event) => setText(event.target.value)} rows={14} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5 font-sans text-sm leading-relaxed" />
        </label>
        <label className="block text-sm">
          圖片
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="mt-1 block w-full text-xs"
            onChange={(event) => setFiles([...(event.target.files ?? [])])}
          />
        </label>
        {files.length > 0 ? <p className="text-xs text-sage-ink">已選 {files.length} 張，將存到伺服器 public/uploads</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {note ? <p className="text-sm text-sage-ink">{note}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-white disabled:bg-mute">
            {pending ? "上傳中…" : "上傳到待上架"}
          </button>
          <button type="button" className="rounded-2xl bg-sand px-4 py-3 text-sm" onClick={() => setText(SAMPLE)}>
            填入示範訊息
          </button>
        </div>
      </form>

      <aside className="space-y-3">
        <h2 className="font-serif-tc text-lg font-bold">伺服器會這樣讀</h2>
        {drafts.length === 0 ? <p className="text-sm text-pebble">貼上文字後，這裡會預覽解析結果。</p> : null}
        {drafts.map((draft, index) => (
          <article key={`${draft.title}-${index}`} className="rounded-3xl border border-line bg-white p-4">
            <p className="text-caption font-semibold tracking-wider text-sage">{draft.brand}</p>
            <h3 className="mt-1 font-bold text-ink">{draft.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-mist">{draft.subtitle}</p>
            <p className="mt-2 text-sm font-bold">{draft.tiers[0] ? ntd(draft.tiers[0].price) : "尚未讀到價格"}</p>
            <p className="mt-1 text-caption text-pebble">
              {draft.tiers.map((tier) => `${tier.label} ${tier.price}`).join(" · ") || "無階梯價"}
            </p>
            <p className="mt-1 text-caption text-pebble">規格：{draft.specs.join("、")}</p>
            <p className="mt-1 text-caption text-sage-ink">
              {[draft.cutoff ? `${draft.cutoff}截單` : "", draft.arrival].filter(Boolean).join(" · ") || "未讀到截單或到貨"}
            </p>
          </article>
        ))}
      </aside>
    </div>
  );
}
