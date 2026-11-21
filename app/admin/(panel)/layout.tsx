import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-bark">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </div>
  );
}
