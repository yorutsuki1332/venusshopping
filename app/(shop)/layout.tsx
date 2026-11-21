import { ShopChrome } from "@/components/shop/ShopChrome";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { settings } = readDb();
  return (
    <div className="min-h-screen bg-cream text-bark">
      <ShopChrome
        brand={settings.brand}
        endsAt={settings.campaignEndsAt}
        giftThreshold={settings.giftThreshold}
        giftLabel={settings.giftLabel}
      >
        {children}
      </ShopChrome>
    </div>
  );
}
