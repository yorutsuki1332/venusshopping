import type { ParsedDraft, Tier } from "./types";

const UNIT = "支|包|件|盒|瓶|罐|條|組|袋|個|套";

type PriceHit = {
  min: number;
  price: number;
  unit: string;
  openEnded: boolean;
};

function toInt(raw: string) {
  const n = Number(raw.replace(/[,，\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function cleanTitle(line: string) {
  return line
    .replace(/^【(?:開團|商品|新品|團購)】\s*/, "")
    .replace(/^[^\p{L}\p{N}(（]+|[^\p{L}\p{N})）]+$/gu, "")
    .trim();
}

function lineValue(lines: string[], labels: string[]) {
  const re = new RegExp(`^-?\\s*(?:${labels.join("|")})\\s*[:：︰]\\s*(.+)$`, "i");
  for (const line of lines) {
    const match = line.match(re);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function isPriceLine(line: string) {
  return /建議零售價|團購價|優惠價|跟團價|售價|特價|原價|市價/.test(line) ||
    new RegExp(`(?:HK\\$|NT\\$|＄|\\$)\\s*\\d[\\d,]*\\s*\\/\\s*(?:${UNIT})`).test(line);
}

function parsePriceLine(line: string): PriceHit[] {
  if (/^(?:原價|市價)\s*[:：︰]/.test(line) && !/\$\s*\d+\s*\//.test(line)) return [];

  const found: PriceHit[] = [];
  const slash = new RegExp(
    `(?:HK\\$|NT\\$|＄|\\$)?\\s*(\\d[\\d,]*)\\s*\\/\\s*(${UNIT})(?:\\s*[（(]\\s*(\\d+)\\s*(?:${UNIT})\\s*起\\s*[）)])?`,
    "g",
  );
  for (const match of line.matchAll(slash)) {
    found.push({
      min: match[3] ? toInt(match[3]) : 0,
      price: toInt(match[1] ?? ""),
      unit: match[2] ?? "",
      openEnded: Boolean(match[3]),
    });
  }

  const bulk = new RegExp(
    `(\\d+)\\s*(${UNIT})\\s*(?:或以上|以上)\\s*[:：︰]\\s*(?:HK\\$|NT\\$|＄|\\$)?\\s*(\\d[\\d,]*)`,
    "g",
  );
  for (const match of line.matchAll(bulk)) {
    found.push({
      min: toInt(match[1] ?? ""),
      price: toInt(match[3] ?? ""),
      unit: match[2] ?? "",
      openEnded: true,
    });
  }

  if (!found.length) {
    const classic = new RegExp(
      `(\\d+)\\s*(${UNIT})\\s*[^0-9\\n]{0,6}(?:HK\\$|NT\\$|＄|\\$)?\\s*(\\d[\\d,]*)`,
      "g",
    );
    for (const match of line.matchAll(classic)) {
      found.push({
        min: toInt(match[1] ?? ""),
        price: toInt(match[3] ?? ""),
        unit: match[2] ?? "",
        openEnded: false,
      });
    }
    const base = line.match(
      /(?:團購價|優惠價|跟團價|售價|特價)\s*[:：︰]?\s*(?:HK\$|NT\$|＄|\$)?\s*(\d[\d,]*)/,
    );
    if (base?.[1]) {
      found.push({ min: 1, price: toInt(base[1]), unit: found[0]?.unit || "件", openEnded: false });
    }
  }

  const explicit = found.filter((hit) => hit.min > 0 && hit.price > 0);
  const implicit = found.filter(
    (hit) => hit.min === 0 && hit.price > 0 && !explicit.some((item) => item.price === hit.price),
  );
  return [...implicit.map((hit) => ({ ...hit, min: 1 })), ...explicit];
}

function toTiers(hits: PriceHit[]): Tier[] {
  const map = new Map<number, PriceHit>();
  for (const hit of hits) {
    const prev = map.get(hit.min);
    if (!prev || hit.price < prev.price) map.set(hit.min, hit);
  }
  return [...map.values()]
    .sort((a, b) => a.min - b.min)
    .map((hit) => {
      const unit = hit.unit || "件";
      const label = hit.min <= 1 ? `1${unit}` : hit.openEnded ? `${hit.min}${unit}起` : `${hit.min}${unit}`;
      return { min: hit.min, price: hit.price, label };
    });
}

function parseCutoff(block: string) {
  const labeled = block.match(/截\s*[:：︰]\s*(\d{1,2}月\d{1,2}日)/);
  if (labeled?.[1]) return labeled[1];
  const trailing = block.match(/(\d{1,2}月\d{1,2}日)\s*截單/);
  return trailing?.[1] ?? "";
}

function parseArrival(block: string) {
  const port = block.match(/預計\s*(\d{1,2}月[^🚚\n]{0,6}?)到港/);
  if (port?.[1]) return `預計${port[1]}到港`;
  const local = block.match(/(\d{1,2}月(?:上旬|中旬|下旬|底|初)?到貨)/);
  return local?.[1] ?? "";
}

function detectBrand(title: string, explicit: string) {
  if (explicit) return explicit;
  const rest = title.replace(/^(?:紐西蘭|新西蘭|澳洲|泰國|韓國|日本|台灣|臺灣|香港|美國|法國)\s*/, "");
  const latin = rest.match(/^([A-Za-z][A-Za-z0-9]*(?:\s+[A-Z][A-Za-z0-9]*)*)/);
  if (latin?.[1] && latin[1].length >= 3) return latin[1];
  return "團購選品";
}

function specFromTitle(title: string) {
  const wrapped = title.match(/[（(]([^）)]+)[）)]\s*$/);
  if (wrapped?.[1]) return wrapped[1].trim();
  const size = title.match(/(\d+(?:\.\d+)?\s*(?:ml|l|g|kg))\s*$/i);
  return size?.[1]?.replace(/\s/g, "") ?? "";
}

const META_LINE =
  /^-?\s*(?:品牌|牌子|原價|市價|團購價|優惠價|跟團價|售價|特價|建議零售價|規格|顏色|色系|尺寸|口味|說明|描述|介紹|備註|標籤|活動|心得|開箱|團友|截團|到貨)\s*[:：︰]/;

function looksLikeTitle(line: string) {
  const title = cleanTitle(line);
  if (title.length < 4 || title.length > 40) return false;
  if (!/^[\p{L}\p{N}]/u.test(title)) return false;
  if (isPriceLine(line) || /\$|／|\/\s*(?:支|包|件|盒|瓶)/.test(title)) return false;
  if (/^(?:截|規格|建議|數量|所有進口|聲明)/.test(title)) return false;
  if (/[。！!？?，、]/.test(title)) return false;
  return true;
}

function extractDescription(lines: string[], title: string) {
  const body: string[] = [];
  let skippingDisclaimer = false;
  let skippingRecap = false;

  for (const line of lines) {
    if (skippingRecap) continue;
    if (/聲明/.test(line) && /==|⚠/.test(line)) {
      skippingDisclaimer = true;
      continue;
    }
    if (/^✨{2,}\s*$/.test(line)) {
      skippingDisclaimer = false;
      skippingRecap = true;
      continue;
    }
    if (skippingDisclaimer) continue;
    if (cleanTitle(line) === title) continue;
    if (!line || META_LINE.test(line) || isPriceLine(line)) continue;
    if (/^截\s*[:：︰]/.test(line) || /\d{1,2}月\d{1,2}日\s*截單/.test(line)) continue;
    if (/預計.+到港/.test(line) || /\d{1,2}月(?:上旬|中旬|下旬|底|初)?到貨/.test(line)) continue;
    if (/^數量有限/.test(line)) continue;
    body.push(line);
  }

  return body.join("\n").trim();
}

function excerpt(description: string) {
  const line = description
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.length >= 8 && !item.startsWith("所有進口貨品"));
  if (!line) return "由 WhatsApp 訊息帶入，請店家確認品名、價格與規格後再上架。";
  const cleaned = line.replace(/^[^\p{L}\p{N}(（]+/u, "").replace(/[^\p{L}\p{N})）]+$/u, "");
  return cleaned.length > 90 ? `${cleaned.slice(0, 90)}…` : cleaned;
}

function parseBlock(block: string): ParsedDraft {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const marked = lines.find((line) => /^【(?:開團|商品|新品|團購)】/.test(line));
  const title = cleanTitle(marked || lines.find((line) => looksLikeTitle(line)) || lines[0] || "") || "未命名團購商品";
  const brand = detectBrand(title, lineValue(lines, ["品牌", "牌子"]));
  const description = extractDescription(lines, title);
  const explicitSubtitle = lineValue(lines, ["說明", "描述", "介紹"]);
  const cutoff = parseCutoff(block);
  const arrival = parseArrival(block);
  const quote = lineValue(lines, ["心得", "開箱", "團友"]);
  const specRaw = lineValue(lines, ["規格", "顏色", "色系", "尺寸", "口味"]);
  const specs = (specRaw || specFromTitle(title) || "均碼")
    .split(/[、,，|｜]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const hits = lines.filter(isPriceLine).flatMap(parsePriceLine);
  const tiers = toTiers(hits);
  const origMatch = block.match(/(?:原價|市價)\s*[:：︰]?\s*(?:HK\$|NT\$|＄|\$)?\s*([\d,，]+)/);
  let origPrice = origMatch ? toInt(origMatch[1] ?? "") : tiers[0]?.price ?? 0;
  if (!tiers.length && origPrice > 0) tiers.push({ min: 1, label: "1件", price: origPrice });
  if (origPrice > 0 && tiers[0] && origPrice < tiers[0].price) origPrice = tiers[0].price;

  const note = lineValue(lines, ["備註", "標籤", "活動"]);
  const badge = cutoff ? `${cutoff}截單` : arrival || note || "WhatsApp 新團・待確認";

  return {
    brand,
    title,
    subtitle: explicitSubtitle || excerpt(description),
    description,
    badge,
    quote,
    cutoff,
    arrival,
    unit: tiers[0]?.label.replace(/^\d+/, "").replace(/起$/, "") || "",
    origPrice,
    tiers,
    specs,
    raw: block.trim(),
  };
}

function splitLoose(chunk: string) {
  const lines = chunk.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let seenPrice = false;
  let currentTitle = "";

  const flush = () => {
    const text = current.join("\n").trim();
    if (text) blocks.push(text);
    current = [];
    seenPrice = false;
    currentTitle = "";
  };

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index] ?? "";
    const trimmed = raw.trim();
    if (!currentTitle && trimmed) currentTitle = cleanTitle(trimmed);

    if (!trimmed && seenPrice) {
      let look = index + 1;
      while (look < lines.length && !(lines[look] ?? "").trim()) look += 1;
      const next = (lines[look] ?? "").trim();
      if (next && looksLikeTitle(next) && cleanTitle(next) !== currentTitle) {
        const window = lines
          .slice(look, look + 6)
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 3);
        const follow = window[1] ?? "";
        if (isPriceLine(follow) || /^截/.test(follow) || /截單|到港|到貨/.test(follow)) {
          flush();
          continue;
        }
      }
    }

    current.push(raw);
    if (isPriceLine(trimmed) && !/^(?:原價|市價)/.test(trimmed)) seenPrice = true;
  }

  flush();
  return blocks;
}

export function parseWhatsAppCatalog(text: string): ParsedDraft[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const ruled = normalized.split(/\n\s*(?:-{3,}|={3,})\s*\n/);
  const blocks = ruled.flatMap((chunk) => {
    const marked = chunk
      .split(/(?=【(?:開團|商品|新品|團購)】)/)
      .map((piece) => piece.trim())
      .filter(Boolean);
    return marked.flatMap(splitLoose);
  });

  return blocks.map(parseBlock);
}
