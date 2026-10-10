// Generates public/og-image.jpg, the 1200x630 preview shown when the site is shared on WhatsApp,
// Facebook, X, etc. Re-run after changing the hero photo or logo: node scripts/generate-og-image.mjs
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630
const HERO = 'public/images/services/hero-laundromat.jpg'
const LOGO = 'src/assets/brand/logo-white.png'
const OUT = 'public/og-image.jpg'

const overlay = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#002a5c" stop-opacity="0.95"/>
      <stop offset="0.65" stop-color="#002a5c" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#002a5c" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#fade)"/>
  <text x="72" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="62" font-weight="700" fill="#ffffff">Home Pick Up &amp; Delivery</text>
  <text x="72" y="378" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="62" font-weight="700" fill="#ffffff">Laundry in Enugu</text>
  <text x="72" y="450" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="30" fill="#ffffff" fill-opacity="0.85">Wash · Iron · Dry Cleaning · Express 24h</text>
  <rect x="72" y="500" width="330" height="56" rx="28" fill="#ffb300"/>
  <text x="237" y="537" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#002a5c">shalahrexlaundry.ng</text>
</svg>`)

const logo = await sharp(LOGO).resize({ width: 320 }).png().toBuffer()

await sharp(HERO)
  .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: 120, left: 72 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT)

console.log(`Wrote ${OUT}`)
