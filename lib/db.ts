import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import type { Database, Product } from "./types";

const runtimeRoot = process.env.VERCEL ? path.join("/tmp", "atelier") : process.cwd();
const dataDir = path.join(runtimeRoot, "data");
const dbFile = path.join(dataDir, "store.json");

function seed(): Database {
  const now = new Date().toISOString();
  const ends = new Date(Date.now() + (14 * 60 + 28) * 60 * 1000).toISOString();
  const base = {
    joined: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  const published = (
    partial: Omit<
      Product,
      "status" | "createdAt" | "updatedAt" | "publishedAt" | "source" | "joined" | "description" | "cutoff" | "arrival" | "unit"
    > & {
      joined: number;
    },
  ): Product => ({
    description: "",
    cutoff: "",
    arrival: "",
    unit: "",
    ...partial,
    status: "published",
    joined: partial.joined,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    source: {
      channel: "seed",
      sender: "主理人",
      text: "",
      receivedAt: now,
    },
  });

  return {
    settings: {
      brand: "ATELIER SEOUL ・ 每日溫柔提案",
      heroTitle: "Effortless Chic — 韓國設計師秋日穿搭與香氛選物團",
      heroSubtitle:
        "主理人親赴首爾漢南洞工作室洽談，獨家開團 78 折起，把韓劇女主角的鬆弛感穿在身上。",
      heroImage:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      tags: ["#漢南洞設計師", "#莫蘭迪奶茶色", "#小眾香氛蠟燭"],
      campaignEndsAt: ends,
      giftThreshold: 2000,
      giftLabel: "滿 NT$ 2,000 贈首爾品牌帆布袋",
      fpsId: "",
      fpsName: "",
    },
    products: [
      published({
        id: "kr-1",
        brand: "HANNAM STUDIO ・ 漢南洞設計師款",
        title: "軟糯燕麥色小香風針織開襟外套（附珍珠扣）",
        subtitle: "高支數親膚包芯紗不刺癢，微落肩顯瘦版型，單穿或當外搭都充滿溫柔氣質。",
        badge: "IG 網紅瘋搶・團購75折",
        quote: "實品顏色超級溫柔！材質完全不刺膚，已經揪姊妹再帶兩件～",
        origPrice: 1880,
        tiers: [
          { min: 1, label: "1件 團購價", price: 1380 },
          { min: 2, label: "2件 閨蜜價", price: 1280 },
          { min: 4, label: "4件 姊妹團", price: 1180 },
        ],
        specs: ["奶油燕麥 (F)", "鼠尾草灰綠 (F)", "柔霧玫瑰粉 (F)"],
        images: [
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        ],
        joined: 214,
      }),
      published({
        id: "kr-2",
        brand: "NONFICTION INSPIRED ・ 首爾香氛實驗室",
        title: "無花果與白麝香大豆香氛蠟燭 200g（附木蓋）",
        subtitle: "100% 天然植物大豆蠟低溫燃燒，睡前點燃釋放木質奶香，打造療癒房間角落。",
        badge: "滿兩件贈火柴禮盒",
        quote: "點起來是很乾淨的奶香，不會衝，放在床頭剛剛好。",
        origPrice: 1150,
        tiers: [
          { min: 1, label: "1顆 質感價", price: 890 },
          { min: 2, label: "2顆 禮盒組", price: 820 },
          { min: 4, label: "4顆 囤貨價", price: 750 },
        ],
        specs: ["No.01 無花果白麝香", "No.04 晨露鼠尾草", "No.07 檀木雪松"],
        images: [
          "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
        ],
        joined: 168,
      }),
      published({
        id: "kr-3",
        brand: "MARHEN STYLE ・ 韓國小眾包袋",
        title: "雲朵褶皺純素皮革腋下包（附斜背長肩帶）",
        subtitle: "輕量僅 240g，大容量可輕鬆放入長夾與折疊傘，百搭莫蘭迪色系。",
        badge: "本團限定色・限量80顆",
        quote: "容量比想像中能裝，拿鐵奶杏色跟針織外套很搭。",
        origPrice: 1690,
        tiers: [
          { min: 1, label: "1顆 團購價", price: 1290 },
          { min: 2, label: "2顆 雙色帶", price: 1190 },
          { min: 3, label: "3顆 享免運", price: 1120 },
        ],
        specs: ["拿鐵奶杏", "焦糖可可", "極簡霧黑"],
        images: [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
        ],
        joined: 73,
      }),
      {
        ...base,
        id: "kr-pending",
        status: "pending",
        publishedAt: null,
        brand: "HANNAM STUDIO",
        title: "柔霧玫瑰針織披肩（附珍珠別針）",
        subtitle: "輕盈莫代爾混紡，春秋外搭剛剛好，單穿不會刺膚。",
        description: "",
        cutoff: "",
        arrival: "",
        unit: "",
        badge: "IG 限時 48 小時",
        quote: "顏色比照片更溫柔，已經揪姊妹一起帶。",
        origPrice: 1680,
        tiers: [
          { min: 1, label: "1 件團購價", price: 1280 },
          { min: 2, label: "2 件優惠", price: 1180 },
          { min: 4, label: "4 件優惠", price: 1080 },
        ],
        specs: ["奶油燕麥", "柔霧玫瑰", "鼠尾草灰"],
        images: [
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
        ],
        joined: 0,
        source: {
          channel: "whatsapp",
          sender: "首爾選貨小帳",
          text: "【開團】柔霧玫瑰針織披肩（附珍珠別針）\n品牌：HANNAM STUDIO\n原價：1680\n團購價：1280（2件 1180／4件 1080）\n規格：奶油燕麥、柔霧玫瑰、鼠尾草灰\n說明：輕盈莫代爾混紡，春秋外搭剛剛好，單穿不會刺膚。\n備註：IG 限時 48 小時\n心得：顏色比照片更溫柔，已經揪姊妹一起帶。",
          receivedAt: now,
        },
      },
    ],
    orders: [],
  };
}

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(seed(), null, 2), "utf8");
  }
}

function save(db: Database) {
  const tmp = `${dbFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  try {
    fs.renameSync(tmp, dbFile);
  } catch {
    fs.copyFileSync(tmp, dbFile);
    fs.unlinkSync(tmp);
  }
}

export function readDb(): Database {
  ensure();
  const db = JSON.parse(fs.readFileSync(dbFile, "utf8")) as Database;
  db.settings.fpsId ??= "";
  db.settings.fpsName ??= "";
  for (const product of db.products) {
    product.description ??= "";
    product.cutoff ??= "";
    product.arrival ??= "";
    product.unit ??= "";
  }
  for (const order of db.orders) {
    order.paymentMethod = "fps";
    order.paymentStatus ??= "unpaid";
    order.reportedAt ??= null;
    order.paidAt ??= null;
  }
  return db;
}

const lockFile = `${dbFile}.lock`;

function sleepSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function withLock<T>(fn: () => T): T {
  const started = Date.now();
  let fd: number | null = null;
  while (fd === null) {
    try {
      fd = fs.openSync(lockFile, "wx");
    } catch {
      try {
        const stat = fs.statSync(lockFile);
        if (Date.now() - stat.mtimeMs > 10000) fs.unlinkSync(lockFile);
      } catch {
        // 另一個寫入剛把鎖釋放。
      }
      if (Date.now() - started > 5000) throw new Error("商店資料暫時忙碌，請再試一次");
      sleepSync(25);
    }
  }
  try {
    return fn();
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lockFile);
  }
}

export function withDb<T>(mutator: (db: Database) => T): Promise<T> {
  return Promise.resolve().then(() =>
    withLock(() => {
      const db = readDb();
      const result = mutator(db);
      save(db);
      return result;
    }),
  );
}

export function newId(prefix: string) {
  return `${prefix}_${randomBytes(5).toString("hex")}`;
}

export function uploadDir() {
  const dir = process.env.VERCEL
    ? path.join("/tmp", "atelier", "uploads")
    : path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
