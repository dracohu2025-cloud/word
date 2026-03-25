import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { analyzeWordRequest } from './src/lib/analyze-service.js'

const DEV_PORT = 3000
const PREVIEW_PORT = 4173

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    server: {
      port: DEV_PORT,
      open: false,
    },
    preview: {
      port: PREVIEW_PORT,
      open: false,
    },
    define: {
      // Don't expose API key to frontend
    },
    plugins: [
      react(),
      {
        name: 'api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/analyze', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const { word } = JSON.parse(body)
                const result = await analyzeWordRequest({
                  word,
                  env,
                  referer: `http://localhost:${DEV_PORT}`,
                  title: 'WordCard',
                })
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = result.status
                res.end(JSON.stringify(result.body))
              } catch (err) {
                console.error('API Error:', err)
                res.statusCode = 500
                res.end(JSON.stringify({ error: '服务器错误', detail: err.message }))
              }
            })
          })
        }
      }
    ]
  }
})
