import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }
  const entries = readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

const scrollSrc = join(process.cwd(), 'scroll')
const scrollDest = join(process.cwd(), 'public', 'scroll')

if (existsSync(scrollSrc)) {
  try {
    copyDir(scrollSrc, scrollDest)
    console.log('✓ Scroll animation files copied to public directory')
  } catch (error) {
    console.error('✗ Failed to copy scroll files:', error.message)
    process.exit(1)
  }
} else {
  console.warn('⚠ Scroll directory not found')
}

