/**
 * Watermark semua asset NFT (PNG) di public/ untuk tampilan web.
 * Jalan sekali: node scripts/watermark-assets.js
 *
 * PENTING: Backup dulu folder public/ (background, body, eye, head, mouth)
 * ke folder lain (misal assets_originals/) untuk dipakai saat generate NFT mint.
 */

import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

const ASSET_DIRS = ['background', 'body', 'eye', 'head', 'mouth']

async function getPngFiles(dir, base = '') {
  const entries = await readdir(join(dir, base), { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) {
      files.push(...(await getPngFiles(dir, rel)))
    } else if (extname(e.name).toLowerCase() === '.png') {
      files.push(rel)
    }
  }
  return files
}

function makeWatermarkSvg(width, height) {
  const text = 'PREVIEW'
  const fontSize = Math.min(width, height) * 0.12
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm { fill: rgba(0,255,65,0.35); font-family: sans-serif; font-weight: bold; }
      </style>
      <text x="50%" y="50%" class="wm" text-anchor="middle" dominant-baseline="middle"
            transform="rotate(-25 ${width/2} ${height/2})" font-size="${fontSize}">${text}</text>
    </svg>
  `.trim())
}

async function watermarkFile(relPath) {
  const full = join(PUBLIC, relPath)
  const meta = await sharp(full).metadata()
  const w = meta.width || 400
  const h = meta.height || 400
  const svg = makeWatermarkSvg(w, h)
  await sharp(full)
    .composite([{ input: svg, left: 0, top: 0 }])
    .toFile(full + '.tmp')
  const { rename } = await import('fs/promises')
  await rename(full + '.tmp', full)
}

async function main() {
  let total = 0
  for (const dir of ASSET_DIRS) {
    const subDir = join(PUBLIC, dir)
    try {
      const files = await getPngFiles(subDir, '')
      for (const f of files) {
        const rel = `${dir}/${f}`
        await watermarkFile(rel)
        total++
        console.log('OK', rel)
      }
    } catch (e) {
      console.error(dir, e.message)
    }
  }
  console.log('\nSelesai. Total file diberi watermark:', total)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
