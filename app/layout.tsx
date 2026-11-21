import type { Metadata } from "next";
import { CartProvider } from "@/components/shop/CartProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATELIER SEOUL ・ 預訂團購",
  description: "韓系質感選物團購。店家確認 WhatsApp 商品後才正式上架。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased selection:bg-blush selection:text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
