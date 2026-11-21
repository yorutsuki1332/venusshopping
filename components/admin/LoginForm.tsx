"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="w-full max-w-md rounded-hero bg-sand p-7 shadow-card"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        setPending(false);
        if (!response.ok) {
          setError("密碼不正確");
          return;
        }
        router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
        router.refresh();
      }}
    >
      <p className="text-xs font-semibold tracking-wider text-sage-ink">ATELIER SEOUL</p>
      <h1 className="font-serif-tc mt-2 text-2xl font-bold text-ink">店家後台</h1>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        登入後可把 WhatsApp 文字與圖片收成待上架，確認無誤再正式上架。
      </p>
      <label className="mt-5 block text-sm">
        密碼
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-hem bg-white px-3 py-2.5"
          autoFocus
        />
      </label>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <button type="submit" disabled={pending} className="mt-5 w-full rounded-2xl bg-sage py-3 text-sm font-semibold text-white">
        {pending ? "登入中…" : "進入後台"}
      </button>
      <p className="mt-4 text-caption leading-relaxed text-pebble">
        本機預設密碼是 seoul-admin。正式使用請在 .env.local 設定 ADMIN_PASSWORD。
      </p>
    </form>
  );
}
