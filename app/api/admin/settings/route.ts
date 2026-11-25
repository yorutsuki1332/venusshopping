import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withDb } from "@/lib/db";

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as { fpsId?: string; fpsName?: string } | null;
  const fpsId = body?.fpsId?.trim() ?? "";
  const fpsName = body?.fpsName?.trim() ?? "";
  if (fpsId.length > 80 || fpsName.length > 40) {
    return NextResponse.json({ error: "轉數快資料太長" }, { status: 400 });
  }

  await withDb((db) => {
    db.settings.fpsId = fpsId;
    db.settings.fpsName = fpsName;
  });

  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
  return NextResponse.json({ ok: true });
}
