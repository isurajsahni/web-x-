/* One-off asset generator: rasterizes the brand SVGs into the PNG/ICO
   files the pages reference. Run:  node build-icons.cjs
   Requires sharp (installed in %TEMP%\wxtools by the build step). */
const fs = require('fs');
const path = require('path');

const SHARP = process.env.WX_SHARP || path.join(process.env.TEMP || '/tmp', 'wxtools', 'node_modules', 'sharp');
const sharp = require(SHARP);

const ROOT = __dirname;
const read = (p) => fs.readFileSync(path.join(ROOT, p));

async function png(svgPath, size, outName) {
  const buf = await sharp(read(svgPath), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  fs.writeFileSync(path.join(ROOT, outName), buf);
  return buf;
}

function buildIco(pngBuffers) {
  // ICONDIR (6) + n * ICONDIRENTRY (16) + image data (PNG-encoded entries)
  const n = pngBuffers.length;
  const header = Buffer.alloc(6 + n * 16);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: icon
  header.writeUInt16LE(n, 4);      // count
  let offset = 6 + n * 16;
  const datas = [];
  pngBuffers.forEach((entry, i) => {
    const base = 6 + i * 16;
    const dim = entry.size >= 256 ? 0 : entry.size;
    header.writeUInt8(dim, base + 0);      // width
    header.writeUInt8(dim, base + 1);      // height
    header.writeUInt8(0, base + 2);        // palette
    header.writeUInt8(0, base + 3);        // reserved
    header.writeUInt16LE(1, base + 4);     // color planes
    header.writeUInt16LE(32, base + 6);    // bits per pixel
    header.writeUInt32LE(entry.buf.length, base + 8);  // size
    header.writeUInt32LE(offset, base + 12);           // offset
    offset += entry.buf.length;
    datas.push(entry.buf);
  });
  return Buffer.concat([header, ...datas]);
}

(async () => {
  // Open Graph / social card
  const og = await sharp(read('og-image.svg'), { density: 192 }).resize(1200, 630).png().toBuffer();
  fs.writeFileSync(path.join(ROOT, 'og-image.png'), og);

  // App / touch icons (from the padded dark icon)
  await png('assets/icon.svg', 512, 'icon-512.png');
  await png('assets/icon.svg', 192, 'icon-192.png');
  await png('assets/icon.svg', 180, 'apple-touch-icon.png');

  // Favicon .ico (multi-size, PNG-encoded entries) from the flat mark
  const sizes = [16, 32, 48];
  const entries = [];
  for (const s of sizes) {
    const buf = await sharp(read('favicon.svg'), { density: 384 }).resize(s, s).png().toBuffer();
    entries.push({ size: s, buf });
  }
  fs.writeFileSync(path.join(ROOT, 'favicon.ico'), buildIco(entries));
  // also a PNG fallback
  await png('favicon.svg', 32, 'favicon-32.png');

  console.log('Generated: og-image.png, icon-512.png, icon-192.png, apple-touch-icon.png, favicon.ico, favicon-32.png');
})().catch((e) => { console.error(e); process.exit(1); });
