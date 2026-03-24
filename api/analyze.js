import { analyzeWordRequest } from '../src/lib/analyze-service.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const result = await analyzeWordRequest({
      word: req.body?.word,
      env: process.env,
      referer: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
      title: 'WordCard',
    })

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error('Vercel API Error:', error)
    res.status(500).json({ error: '服务器错误', detail: error.message })
  }
}
