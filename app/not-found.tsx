import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center text-bark">
      <h1 className="font-serif-tc text-3xl font-bold">找不到這個頁面</h1>
      <Link href="/" className="mt-4 text-sm underline">
        回到選物團
      </Link>
    </main>
  );
}
