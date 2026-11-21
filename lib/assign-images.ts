export function assignImages(productCount: number, images: string[]) {
  const buckets = Array.from({ length: productCount }, () => [] as string[]);
  images.forEach((url, index) => {
    if (productCount === 0) return;
    const target = index < productCount ? index : productCount - 1;
    buckets[target]?.push(url);
  });

  const notes: string[] = [];
  if (productCount > 1 && images.length > productCount) {
    notes.push("多出的圖片已附在最後一項，請在審核頁核對。");
  }
  const missing = buckets.flatMap((bucket, index) => (bucket.length === 0 ? [index + 1] : []));
  if (images.length > 0 && missing.length > 0) {
    notes.push(`第 ${missing.join("、")} 項沒有對到圖片，上架前要補上。`);
  }
  if (images.length === 0 && productCount > 0) {
    notes.push("這批沒有圖片，每一項上架前都要補圖。");
  }
  return { buckets, note: notes.join("") };
}
