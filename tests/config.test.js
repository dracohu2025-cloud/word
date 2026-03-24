import { describe, expect, test } from 'vitest'
import viteConfig from '../vite.config.js'

describe('vite config', () => {
  test('uses a relative base path so built assets work outside site root', () => {
    const config = viteConfig({ mode: 'test' })

    expect(config.base).toBe('./')
  })
})
