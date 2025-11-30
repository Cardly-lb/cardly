import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Function to copy directory recursively
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-scroll-files',
      buildStart() {
        // Copy scroll directory to public during build
        const scrollSrc = join(process.cwd(), 'scroll')
        const scrollDest = join(process.cwd(), 'public', 'scroll')
        if (existsSync(scrollSrc)) {
          try {
            copyDir(scrollSrc, scrollDest)
            console.log('✓ Scroll animation files copied to public directory')
          } catch (error) {
            console.warn('⚠ Failed to copy scroll files:', error.message)
          }
        }
        
        // Copy main JavaScript bundle to public during build
        const jsBundleSrc = join(process.cwd(), 'index-8YjIcPvu.js')
        const jsBundleDest = join(process.cwd(), 'public', 'index-8YjIcPvu.js')
        if (existsSync(jsBundleSrc)) {
          try {
            copyFileSync(jsBundleSrc, jsBundleDest)
            console.log('✓ Main JavaScript bundle copied to public directory')
          } catch (error) {
            console.warn('⚠ Failed to copy JS bundle:', error.message)
          }
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: join(process.cwd(), 'index.html')
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification (using esbuild which is built-in, faster than terser)
    minify: 'esbuild'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['gsap', 'scrolltrigger']
  }
})