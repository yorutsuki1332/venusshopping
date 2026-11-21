import assert from "node:assert/strict";
import { assignImages } from "../lib/assign-images.ts";
import { parseWhatsAppCatalog } from "../lib/parser.ts";

const classic = `【開團】雲朵褶皺純素皮革腋下包（補貨團）
品牌：MARHEN STYLE
原價：1,690
團購價：1290（2件 1190／3件 1120）
規格：拿鐵奶杏、焦糖可可、極簡霧黑
說明：輕量僅 240g，可放入長夾與折疊傘。
備註：本團限定色
心得：背起來很輕。

---

【開團】晨露鼠尾草護手霜 50ml
品牌：NONFICTION INSPIRED
原價：680
團購價：520（2條 480）
規格：晨露鼠尾草、無花果白麝香
說明：吸收快、不黏膩。`;

const classicDrafts = parseWhatsAppCatalog(classic);
assert.equal(classicDrafts.length, 2);
assert.equal(classicDrafts[0]?.title, "雲朵褶皺純素皮革腋下包（補貨團）");
assert.equal(classicDrafts[0]?.brand, "MARHEN STYLE");
assert.equal(classicDrafts[0]?.origPrice, 1690);
assert.deepEqual(
  classicDrafts[0]?.tiers.map((tier) => [tier.min, tier.price]),
  [
    [1, 1290],
    [2, 1190],
    [3, 1120],
  ],
);
assert.deepEqual(classicDrafts[0]?.specs, ["拿鐵奶杏", "焦糖可可", "極簡霧黑"]);
assert.equal(classicDrafts[1]?.tiers[1]?.price, 480);

const ecostore = `紐西蘭 Ecostore 超敏感配方洗衣液 1L

建議零售價︰$75/支，2支或以上:$65/支

截：10月28日
🚚預計1月底到港🚚

所有進口貨品之貨期或受船運/空運延誤影響，恕不接受貨期延誤原因取消訂單，下單前敬請諒解 介意請勿落單

👶🏻💙 屋企有BB、皮膚容易敏感嘅朋友仔
洗衫用品真係要揀得細心啲！🥹✨

🇦🇺 澳洲人氣品牌 ECOSTORE
🫧 Ultra Sensitive 超敏感配方洗衣液 登場啦！💥

💙 4大貼心賣點：
✨ 🚫 無香料、無色素配方

-規格︰1L

==⚠️ 聲明 ⚠️==
1.本貨品為平行進口正貨
2.所有帖文內容只作分享及參考用途

✨✨✨

紐西蘭 Ecostore 超敏感配方洗衣液 1L

$75/支

✨✨✨
數量有限,售完即止,不作另行通知`;

const lanna = `🟡泰國 LANNA SEVEN 泰式草本足浴包(1袋10包)🟡

建議零售價： $48/包 ; $45/包 (2包起)

截：10月25日
🚚預計11月底到港🚚

天氣凍左，最適合🌿中藥浸腳，愛❤️爸媽🙇🏻‍♀️就送健康俾佢地

-規格 : 1袋10包
-泰國直送`;

const mousse = `Cellology發光慕斯面膜100ml

$89/件
10月28日截單
11月下旬到貨

✨10秒奇蹟！PDRN Glow Mousse Pack，讓肌膚自體發光！ ✨

你還在敷著滴滴答答的面膜，苦苦等待30分鐘嗎？
薄擦一層（約50元硬幣大小），厚敷一層（約500元硬幣大小）。`;

const bubble = `Cellology深海水漾泡泡精華95ml

$89/件
10月28日截單
11月下旬到貨

【🔥海洋深層水爆發力！1秒降溫🔥泛紅敏感肌急救首選！】

輕輕一噴，彷彿將蔚藍深海敷上臉龐！`;

const posts = parseWhatsAppCatalog([ecostore, lanna, mousse, bubble].join("\n\n"));
assert.equal(posts.length, 4, posts.map((item) => item.title).join(" | "));

const [wash, foot, mask, serum] = posts;
assert.equal(wash?.brand, "Ecostore");
assert.equal(wash?.title, "紐西蘭 Ecostore 超敏感配方洗衣液 1L");
assert.deepEqual(
  wash?.tiers.map((tier) => [tier.min, tier.price, tier.label]),
  [
    [1, 75, "1支"],
    [2, 65, "2支起"],
  ],
);
assert.equal(wash?.cutoff, "10月28日");
assert.equal(wash?.arrival, "預計1月底到港");
assert.deepEqual(wash?.specs, ["1L"]);
assert.match(wash?.subtitle ?? "", /屋企有BB/);
assert.match(wash?.description ?? "", /無香料/);
assert.doesNotMatch(wash?.description ?? "", /平行進口/);
assert.doesNotMatch(wash?.description ?? "", /\$75\/支/);

assert.equal(foot?.brand, "LANNA SEVEN");
assert.equal(foot?.title, "泰國 LANNA SEVEN 泰式草本足浴包(1袋10包)");
assert.deepEqual(
  foot?.tiers.map((tier) => [tier.min, tier.price]),
  [
    [1, 48],
    [2, 45],
  ],
);
assert.equal(foot?.tiers[1]?.label, "2包起");
assert.equal(foot?.cutoff, "10月25日");
assert.equal(foot?.arrival, "預計11月底到港");
assert.deepEqual(foot?.specs, ["1袋10包"]);
assert.match(foot?.description ?? "", /泰國直送/);

assert.equal(mask?.brand, "Cellology");
assert.equal(mask?.title, "Cellology發光慕斯面膜100ml");
assert.deepEqual(mask?.tiers.map((tier) => [tier.min, tier.price, tier.label]), [[1, 89, "1件"]]);
assert.equal(mask?.cutoff, "10月28日");
assert.equal(mask?.arrival, "11月下旬到貨");
assert.deepEqual(mask?.specs, ["100ml"]);
assert.equal(mask?.tiers.some((tier) => tier.price === 50 || tier.price === 500), false);
assert.match(mask?.description ?? "", /50元硬幣/);
assert.match(mask?.description ?? "", /10秒奇蹟/);

assert.equal(serum?.brand, "Cellology");
assert.equal(serum?.specs[0], "95ml");
assert.equal(serum?.tiers[0]?.price, 89);
assert.equal(serum?.arrival, "11月下旬到貨");

const paired = assignImages(3, ["a.jpg", "b.jpg", "c.jpg"]);
assert.deepEqual(paired.buckets, [["a.jpg"], ["b.jpg"], ["c.jpg"]]);
assert.equal(paired.note, "");

const short = assignImages(3, ["a.jpg", "b.jpg"]);
assert.deepEqual(short.buckets, [["a.jpg"], ["b.jpg"], []]);
assert.match(short.note, /第 3 項沒有對到圖片/);

const extra = assignImages(2, ["a.jpg", "b.jpg", "c.jpg"]);
assert.deepEqual(extra.buckets, [["a.jpg"], ["b.jpg", "c.jpg"]]);
assert.match(extra.note, /最後一項/);

console.log("parser ok", posts.map((item) => item.title).join(" / "));
