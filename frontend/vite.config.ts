import { defineConfig, loadEnv, type Plugin } from 'vite'
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

export default defineConfig(({ mode }) => {
  // Resolve the NVIDIA key/model from the shell environment AND from a .env file
  // in either the frontend dir or the repo root — so it works however you keep
  // it locally (exported/sourced, frontend/.env, or ../.env at the repo root).
  const localEnv = loadEnv(mode, process.cwd(), ['VITE_', 'NVIDIA_'])
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), ['VITE_', 'NVIDIA_'])
  const pick = (k: string) => process.env[k] ?? localEnv[k] ?? rootEnv[k] ?? ''
  const NVIDIA_API_KEY = pick('NVIDIA_API_KEY')
  const NVIDIA_MODEL = pick('NVIDIA_MODEL')

  return {
  plugins: [react(), swissephAssets()],
  // Inject the NVIDIA env vars as literals so import.meta.env.NVIDIA_* resolves
  // from either the .env file or an exported/sourced shell variable.
  define: {
    'import.meta.env.NVIDIA_API_KEY': JSON.stringify(NVIDIA_API_KEY),
    'import.meta.env.NVIDIA_MODEL': JSON.stringify(NVIDIA_MODEL),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    // Dev proxy for the horoscope chat: the browser calls same-origin
    // /nv-api/* and Vite forwards it to NVIDIA with the Authorization header
    // attached here (server-side). This avoids CORS and keeps the key out of
    // the browser's network requests for local development.
    proxy: {
      '/nv-api': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/nv-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (NVIDIA_API_KEY) proxyReq.setHeader('authorization', `Bearer ${NVIDIA_API_KEY}`)
          })
        },
      },
    },
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
  }
})
