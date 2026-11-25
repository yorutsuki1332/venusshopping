"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentStatus } from "@/lib/types";

const actions: { status: PaymentStatus; label: string }[] = [
  { status: "paid", label: "確認入帳" },
  { status: "reported", label: "標成待核對" },
  { status: "unpaid", label: "改回未付" },
];

export function OrderActions({ orderId, paymentStatus }: { orderId: string; paymentStatus: PaymentStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");

  async function update(status: PaymentStatus) {
    setPending(status);
    setError("");
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: status }),
    });
    const data = (await response.json()) as { error?: string };
    setPending("");
    if (!response.ok) {
      setError(data.error || "沒有更新");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions
        .filter((action) => action.status !== paymentStatus)
        .map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={pending !== ""}
            onClick={() => update(action.status)}
            className="rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-cocoa disabled:bg-mute"
          >
            {pending === action.status ? "更新中…" : action.label}
          </button>
        ))}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
