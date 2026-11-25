"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FpsSettingsForm({ fpsId, fpsName }: { fpsId: string; fpsName: string }) {
  const router = useRouter();
  const [id, setId] = useState(fpsId);
  const [name, setName] = useState(fpsName);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fpsId: id, fpsName: name }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "沒有儲存");
      return;
    }
    setMessage("已儲存。新的跟團頁會顯示這組轉數快。");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-lg space-y-4 rounded-3xl border border-line bg-paper p-5">
      <label className="block text-sm">
        轉數快識別碼
        <input
          value={id}
          onChange={(event) => setId(event.target.value)}
          placeholder="電話、電郵或 FPS ID"
          className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        收款人名稱
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="銀行顯示的姓名"
          className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5"
        />
      </label>
      <p className="text-xs leading-relaxed text-stone">顧客只能用轉數快付款。這裡留空時，訂單頁不會顯示可轉帳的帳戶。</p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-sage-ink">{message}</p> : null}
      <button type="submit" disabled={pending} className="rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-white disabled:bg-mute">
        {pending ? "儲存中…" : "儲存轉數快"}
      </button>
    </form>
  );
}
