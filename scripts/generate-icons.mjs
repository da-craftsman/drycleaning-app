import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SRC = 'use/favicon.png'
const OUT_DIR = 'public/icons'
const PAD_BG = '#005bbf'

await mkdir(OUT_DIR, { recursive: true })

await sharp(SRC).resize(192, 192).png().toFile(`${OUT_DIR}/icon-192.png`)
await sharp(SRC).resize(512, 512).png().toFile(`${OUT_DIR}/icon-512.png`)
await sharp(SRC).resize(180, 180).png().toFile(`${OUT_DIR}/apple-touch-icon.png`)
await sharp(SRC).resize(32, 32).png().toFile(`${OUT_DIR}/favicon-32.png`)
await sharp(SRC).resize(16, 16).png().toFile(`${OUT_DIR}/favicon-16.png`)

// Maskable icon needs safe-zone padding: source scaled to ~70% inside a solid-color square
const maskableSize = 512
const innerSize = Math.round(maskableSize * 0.7)
const resizedInner = await sharp(SRC).resize(innerSize, innerSize).png().toBuffer()
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: PAD_BG,
  },
})
  .composite([{ input: resizedInner, gravity: 'center' }])
  .png()
  .toFile(`${OUT_DIR}/icon-maskable-512.png`)

console.log('Icons generated in', OUT_DIR)
