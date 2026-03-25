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

  test('avoids the ports reserved for doocs md-editor', () => {
    const config = viteConfig({ mode: 'test' })

    expect(config.server.port).toBe(3000)
    expect(config.preview.port).toBe(4173)
    expect([config.server.port, config.preview.port]).not.toContain(5173)
    expect([config.server.port, config.preview.port]).not.toContain(5174)
  })

  test('allows enough execution time for slower LLM models in production', () => {
    expect(vercelConfig.functions['api/analyze.js'].maxDuration).toBeGreaterThanOrEqual(300)
  })

  test('rewrites the newton sub-route back to the SPA entry on Vercel', () => {
    expect(vercelConfig.rewrites).toEqual(
      expect.arrayContaining([
        { source: '/newton', destination: '/index.html' },
        { source: '/newton/(.*)', destination: '/index.html' },
      ]),
    )
  })
})
