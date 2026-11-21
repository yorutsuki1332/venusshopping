"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/inbox", label: "WhatsApp 收件" },
  { href: "/admin/products", label: "商品審核" },
  { href: "/admin/orders", label: "預訂單" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="border-b border-hem bg-foam/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link href="/admin" className="font-serif-tc text-lg font-bold italic text-cocoa">
          店家後台
        </Link>
        <nav className="flex flex-wrap items-center gap-1.5">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  active ? "bg-sage text-white" : "bg-sand text-cocoa"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/" className="rounded-full px-3 py-1.5 text-xs text-stone underline">
            前台
          </Link>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs text-stone"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/admin/login");
              router.refresh();
            }}
          >
            登出
          </button>
        </nav>
      </div>
    </header>
  );
}
