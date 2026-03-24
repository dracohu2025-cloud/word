import { defineConfig, loadEnv } from 'vite'
import { analyzeWordRequest } from './src/lib/analyze-service.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    server: {
      port: 3000,
      open: false,
    },
    define: {
      // Don't expose API key to frontend
    },
    plugins: [
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
                  referer: 'http://localhost:3000',
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
