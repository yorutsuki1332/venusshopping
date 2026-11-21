import { assignImages } from "../lib/assign-images.ts";
import { parseWhatsAppCatalog } from "../lib/parser.ts";

const batch = `紐西蘭 Ecostore 超敏感配方洗衣液 1L

建議零售價︰$75/支，2支或以上:$65/支

截：10月28日
🚚預計1月底到港🚚

👶🏻💙 屋企有BB、皮膚容易敏感嘅朋友仔
洗衫用品真係要揀得細心啲！

-規格︰1L

==⚠️ 聲明 ⚠️==
1.本貨品為平行進口正貨

✨✨✨

紐西蘭 Ecostore 超敏感配方洗衣液 1L

$75/支

✨✨✨
數量有限,售完即止,不作另行通知

🟡泰國 LANNA SEVEN 泰式草本足浴包(1袋10包)🟡

建議零售價： $48/包 ; $45/包 (2包起)

截：10月25日
🚚預計11月底到港🚚

天氣凍左，最適合浸腳

-規格 : 1袋10包
-泰國直送

Cellology發光慕斯面膜100ml

$89/件
10月28日截單
11月下旬到貨

✨10秒奇蹟！PDRN Glow Mousse Pack，讓肌膚自體發光！ ✨
薄擦一層（約50元硬幣大小）。`;

const drafts = parseWhatsAppCatalog(batch);
const images = ["laundry.jpg", "foot-bath.jpg"];
const assigned = assignImages(drafts.length, images);

console.log(`收到 1 批文字，切開成 ${drafts.length} 筆待上架`);
console.log(`圖片 ${images.length} 張。${assigned.note}\n`);

drafts.forEach((draft, index) => {
  const image = assigned.buckets[index]?.join("、") || "（無圖，要在審核頁補）";
  console.log(`—— 待上架 #${index + 1} ——`);
  console.log(`品名   ${draft.title}`);
  console.log(`品牌   ${draft.brand}`);
  console.log(`價格   ${draft.tiers.map((tier) => `${tier.label} $${tier.price}`).join("、")}`);
  console.log(`截單   ${draft.cutoff || "—"}`);
  console.log(`到貨   ${draft.arrival || "—"}`);
  console.log(`規格   ${draft.specs.join("、")}`);
  console.log(`摘要   ${draft.subtitle}`);
  console.log(`狀態   pending（前台還看不到）`);
  console.log(`圖片   ${image}`);
  console.log("");
});
