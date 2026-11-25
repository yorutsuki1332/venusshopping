"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ntd } from "@/lib/pricing";
import type { PaymentStatus } from "@/lib/types";

export function FpsPanel({
  orderId,
  total,
  fpsId,
  fpsName,
  paymentStatus,
}: {
  orderId: string;
  total: number;
  fpsId: string;
  fpsName: string;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied("");
      setError("這個瀏覽器沒有複製到剪貼簿");
    }
  }

  async function report() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/orders/${orderId}/report`, { method: "POST" });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "沒有送出");
      return;
    }
    router.refresh();
  }

  const statusLabel =
    paymentStatus === "paid" ? "店家已確認入帳" : paymentStatus === "reported" ? "已通知店家核對入帳" : "尚未轉帳";

  return (
    <section className="mt-6 rounded-3xl bg-sand p-4 text-left">
      <p className="text-xs font-semibold tracking-wider text-sage-ink">轉數快 FPS</p>
      <h2 className="font-serif-tc mt-1 text-lg font-bold text-ink">請用轉數快支付 {ntd(total)}</h2>
      <p className="mt-1 text-xs leading-relaxed text-stone">付款只收轉數快。轉帳時在備註填上訂單編號，方便店家對到這一筆。</p>
      {fpsId ? (
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-pebble">識別碼</dt>
            <dd className="font-semibold">
              {fpsId}{" "}
              <button type="button" className="text-xs text-sage-ink underline" onClick={() => copy("識別碼", fpsId)}>
                複製
              </button>
            </dd>
          </div>
          {fpsName ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-pebble">收款人</dt>
              <dd className="font-semibold">{fpsName}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-pebble">金額</dt>
            <dd className="font-semibold">{ntd(total)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-pebble">訂單編號</dt>
            <dd className="font-semibold">
              {orderId}{" "}
              <button type="button" className="text-xs text-sage-ink underline" onClick={() => copy("編號", orderId)}>
                複製
              </button>
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-danger">店家還沒填寫轉數快識別碼。請先聯絡店家，不要轉去其他帳戶。</p>
      )}
      <p className="mt-3 text-xs text-mist">{copied ? `已複製${copied}` : statusLabel}</p>
      {paymentStatus === "unpaid" && fpsId ? (
        <button
          type="button"
          disabled={pending}
          onClick={report}
          className="mt-3 w-full rounded-2xl bg-sage py-3 text-sm font-semibold text-white disabled:bg-mute"
        >
          {pending ? "送出中…" : "我已用轉數快轉帳"}
        </button>
      ) : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </section>
  );
}
