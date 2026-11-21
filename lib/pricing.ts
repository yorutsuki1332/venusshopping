import type { Tier } from "./types";

export function tierFor(tiers: Tier[], qty: number) {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  let current = sorted[0];
  for (const tier of sorted) {
    if (qty >= tier.min) current = tier;
  }
  return current;
}

export function ntd(amount: number) {
  return `NT$ ${Math.round(amount).toLocaleString("zh-Hant-TW")}`;
}

export function formatTaipei(iso: string) {
  return new Date(iso).toLocaleString("zh-Hant-TW", {
    timeZone: "Asia/Taipei",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
