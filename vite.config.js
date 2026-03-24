import { defineConfig, loadEnv } from 'vite'
import {
  buildPrompt,
  getInputType,
  getSystemPrompt,
  normalizeInput,
  parseWordAnalysis,
  validateInput,
} from './src/lib/analysis.js'

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
                const normalized = normalizeInput(word)
                const validation = validateInput(normalized)

                if (!validation.ok) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: validation.message }))
                  return
                }

                if (!env.OPENROUTER_API_KEY) {
                  res.statusCode = 500
                  res.end(JSON.stringify({ error: '缺少 OPENROUTER_API_KEY 配置' }))
                  return
                }

                const inputType = getInputType(normalized)
                const prompt = buildPrompt(normalized, inputType)

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'WordCard',
                  },
                  body: JSON.stringify({
                    model: env.OPENROUTER_MODEL || 'google/gemini-3.1-flash-lite-preview',
                    messages: [
                      { role: 'system', content: getSystemPrompt() },
                      { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096,
                  })
                })

                if (!response.ok) {
                  const errText = await response.text()
                  console.error('OpenRouter error:', errText)
                  res.statusCode = 500
                  res.end(JSON.stringify({ error: 'LLM 调用失败', detail: errText }))
                  return
                }

                const data = await response.json()
                const content = data.choices?.[0]?.message?.content || ''

                const parsed = parseWordAnalysis(content, normalized, inputType)

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(parsed))
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
