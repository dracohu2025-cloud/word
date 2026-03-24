import {
  buildPrompt,
  getInputType,
  getSystemPrompt,
  normalizeInput,
  parseWordAnalysis,
  validateInput,
} from './analysis.js'

export async function analyzeWordRequest({
  word,
  env,
  fetchImpl = fetch,
  referer = 'http://localhost:3000',
  title = 'WordCard',
}) {
  const normalized = normalizeInput(word)
  const validation = validateInput(normalized)

  if (!validation.ok) {
    return {
      status: 400,
      body: { error: validation.message },
    }
  }

  if (!env.OPENROUTER_API_KEY) {
    return {
      status: 500,
      body: { error: '缺少 OPENROUTER_API_KEY 配置' },
    }
  }

  const inputType = getInputType(normalized)
  const prompt = buildPrompt(normalized, inputType)

  const response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer,
      'X-Title': title,
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL || 'google/gemini-3.1-flash-lite-preview',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()

    return {
      status: 500,
      body: { error: 'LLM 调用失败', detail: errText },
    }
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return {
    status: 200,
    body: parseWordAnalysis(content, normalized, inputType),
  }
}
