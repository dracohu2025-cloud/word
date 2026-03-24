import { describe, expect, test } from 'vitest'
import { analyzeWordRequest } from '../src/lib/analyze-service.js'

describe('analyze service', () => {
  test('returns validation errors before attempting upstream calls', async () => {
    let called = false

    const result = await analyzeWordRequest({
      word: 'fall apart',
      env: { OPENROUTER_API_KEY: 'test', OPENROUTER_MODEL: 'demo/model' },
      fetchImpl: async () => {
        called = true
        throw new Error('should not be called')
      },
    })

    expect(result.status).toBe(400)
    expect(result.body).toEqual({ error: '英文输入仅支持单个单词' })
    expect(called).toBe(false)
  })

  test('returns a parsed payload from the upstream model response', async () => {
    const result = await analyzeWordRequest({
      word: '缘',
      env: { OPENROUTER_API_KEY: 'test', OPENROUTER_MODEL: 'deepseek/deepseek-v3.2' },
      fetchImpl: async () => new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                word: '缘',
                phonetic: 'yuán',
                translation: '联系与际遇',
                originalImage: '衣服边缘的丝线，缠绕并勾勒出界限。',
                coreSymbolParts: ['丝线', '缠绕', '边界'],
                coreSymbolResult: '命运的交织与连接',
                explanation: '第一段。||第二段。',
                epiphanyEn: 'The thread that weaves chance into destiny.',
                epiphanyCn: '将偶然编织成宿命的那条线',
                mood: 'creative',
              }),
            },
          },
        ],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    })

    expect(result.status).toBe(200)
    expect(result.body.word).toBe('缘')
    expect(result.body.inputType).toBe('chinese')
    expect(result.body.coreSymbolParts).toEqual(['丝线', '缠绕', '边界'])
  })
})
