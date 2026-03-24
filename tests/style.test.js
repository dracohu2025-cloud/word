import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

describe('landing decorative layers', () => {
  test('do not intercept pointer events above interactive content', () => {
    expect(styleSource).toContain('pointer-events: none;')
    expect(styleSource).toContain('.landing-content > *')
    expect(styleSource).toContain('.search-box button svg')
  })

  test('landing layout is only displayed while the landing view is active', () => {
    expect(styleSource).toContain('#landing.active')
    expect(styleSource).toContain('display: flex;')
  })

  test('word card is not stretched to the full container height', () => {
    expect(styleSource).toContain('.card-container')
    expect(styleSource).toContain('align-items: flex-start;')
    expect(styleSource).toContain('align-self: flex-start;')
  })
})
