import { FpsSettingsForm } from "@/components/admin/FpsSettingsForm";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { settings } = readDb();
  return (
    <main className="space-y-4">
      <h1 className="font-serif-tc text-3xl font-bold text-ink">轉數快</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-mist">前台付款只有轉數快。填入你的識別碼和收款人名稱，顧客下單後會看到金額和訂單編號。</p>
      <FpsSettingsForm fpsId={settings.fpsId} fpsName={settings.fpsName} />
    </main>
  );
}
