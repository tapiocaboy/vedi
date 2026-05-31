import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Swiss Ephemeris WASM assets live inside node_modules and the package's
// exports field blocks deep imports. This plugin serves them from /wasm/* in
// dev and emits them into dist/wasm/ in build.
function swissephAssets(): Plugin {
  const pkgWasmDir = path.resolve(__dirname, 'node_modules/swisseph-wasm/wasm')
  const files = ['swisseph.wasm', 'swisseph.data', 'swisseph.js']
  return {
    name: 'swisseph-wasm-assets',
    configureServer(server) {
      server.middlewares.use('/wasm', (req, res, next) => {
        const name = (req.url || '').replace(/^\/+/, '').split('?')[0]
        if (!files.includes(name)) return next()
        const filepath = path.join(pkgWasmDir, name)
        if (!fs.existsSync(filepath)) return next()
        const contentType = name.endsWith('.wasm') ? 'application/wasm'
          : name.endsWith('.js') ? 'application/javascript'
          : 'application/octet-stream'
        res.setHeader('Content-Type', contentType)
        fs.createReadStream(filepath).pipe(res)
      })
    },
    generateBundle() {
      for (const name of files) {
        this.emitFile({
          type: 'asset',
          fileName: `wasm/${name}`,
          source: fs.readFileSync(path.join(pkgWasmDir, name)),
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), swissephAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
