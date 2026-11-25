"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ntd } from "@/lib/pricing";
import { useCart } from "@/components/shop/CartProvider";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, total, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        contact,
        note,
        items: lines.map((line) => ({ productId: line.productId, spec: line.spec, qty: line.qty })),
      }),
    });
    const data = (await response.json()) as { id?: string; error?: string };
    setPending(false);
    if (!response.ok || !data.id) {
      setError(data.error || "登記沒有成功");
      return;
    }
    clear();
    router.push(`/order/${data.id}`);
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-5 py-8 md:grid-cols-5">
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-paper p-6 md:col-span-3">
        <h1 className="font-serif-tc text-2xl font-bold text-ink">跟團登記</h1>
        <p className="text-xs leading-relaxed text-stone">
          付款只收轉數快 FPS。送出後會看到收款識別碼、金額和訂單編號，請用這組資料轉帳。
        </p>
        <label className="block text-sm">
          姓名
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" required />
        </label>
        <label className="block text-sm">
          手機
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="91234567" className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" required />
        </label>
        <label className="block text-sm">
          WhatsApp / LINE（選填）
          <input value={contact} onChange={(event) => setContact(event.target.value)} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" />
        </label>
        <label className="block text-sm">
          備註
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5" />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || lines.length === 0}
          className="w-full rounded-2xl bg-sage py-3 text-sm font-semibold text-white disabled:bg-mute"
        >
          {pending ? "送出中…" : "送出並查看轉數快"}
        </button>
      </form>
      <aside className="rounded-3xl bg-sand p-5 md:col-span-2">
        <h2 className="font-serif-tc text-lg font-bold">本次跟團</h2>
        {lines.length === 0 ? (
          <p className="mt-4 text-sm text-stone">
            清單是空的。<Link href="/" className="underline">回去挑選品</Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {lines.map((line) => (
              <li key={line.key} className="text-sm">
                <p className="font-semibold">{line.title}</p>
                <p className="text-xs text-mist">
                  {line.spec} × {line.qty} ・ {ntd(line.unitPrice * line.qty)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-xl font-bold">{ntd(total)}</p>
      </aside>
    </main>
  );
}
