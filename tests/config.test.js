import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import viteConfig from '../vite.config.js'

const vercelConfig = JSON.parse(
  readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'),
)

describe('vite config', () => {
  test('uses a relative base path so built assets work outside site root', () => {
    const config = viteConfig({ mode: 'test' })

    expect(config.base).toBe('./')
  })

  test('allows enough execution time for slower LLM models in production', () => {
    expect(vercelConfig.functions['api/analyze.js'].maxDuration).toBeGreaterThanOrEqual(60)
  })
})
