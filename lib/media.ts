import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { uploadDir } from "./db";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function sniff(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image/png";
  }
  if (buffer.length >= 6 && buffer.subarray(0, 4).toString("ascii") === "GIF8") {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function saveImageFile(file: File) {
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("單張圖片請小於 4MB");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniff(buffer);
  const claimed = TYPES[file.type] ? file.type : null;
  const mime = sniffed ?? claimed;
  if (!mime || !TYPES[mime]) {
    throw new Error("只接受 JPG、PNG、WEBP 或 GIF");
  }
  if (sniffed && claimed && sniffed !== claimed) {
    throw new Error("圖片格式與檔案內容不符");
  }
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${TYPES[mime]}`;
  fs.writeFileSync(path.join(uploadDir(), name), buffer);
  return `/uploads/${name}`;
}

export async function saveImageFiles(files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    urls.push(await saveImageFile(file));
  }
  return urls;
}
