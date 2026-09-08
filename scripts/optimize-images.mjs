// One-off image optimizer (run: `node scripts/optimize-images.mjs`).
// Resizes oversized art/logo assets down to display size and re-encodes them
// as WebP. Originals are moved to `image-originals/` (git-ignored) as a backup,
// so nothing is lost. Small screenshots and the video are left untouched.
import sharp from "sharp";
import { mkdirSync, renameSync, existsSync, statSync } from "fs";
import { join } from "path";

const dir = "public/work";
const backup = "image-originals";
mkdirSync(backup, { recursive: true });

const jobs = [
  { in: "kling-prince-front.png", out: "kling-prince-front.webp", max: 1000, q: 82 },
  { in: "kling-prince-side.png", out: "kling-prince-side.webp", max: 1000, q: 82 },
  { in: "kling-fox-front.png", out: "kling-fox-front.webp", max: 1000, q: 82 },
  // Logo has text — keep quality high (near lossless).
  { in: "nomo-logo.png", out: "nomo-logo.webp", max: 900, q: 92 },
];

const kb = (p) => Math.round(statSync(p).size / 1024);

for (const j of jobs) {
  const src = join(dir, j.in);
  if (!existsSync(src)) {
    console.log("skip (missing):", src);
    continue;
  }
  const before = kb(src);
  const dst = join(dir, j.out);
  await sharp(src)
    .resize({ width: j.max, height: j.max, fit: "inside", withoutEnlargement: true })
    .webp({ quality: j.q })
    .toFile(dst);
  renameSync(src, join(backup, j.in)); // keep original as backup
  console.log(`${j.in} (${before}KB) -> ${j.out} (${kb(dst)}KB)`);
}
console.log("done");
