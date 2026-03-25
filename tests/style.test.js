import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

describe('newton interactive card styles', () => {
  test('keep decorative background layers from intercepting input', () => {
    expect(styleSource).toContain('pointer-events: none;')
    expect(styleSource).toContain('body::before')
  })

  test('reserve a dedicated viewport for the 3d simulation shell', () => {
    expect(styleSource).toContain('.newton-scene-shell')
    expect(styleSource).toContain('height: 420px;')
    expect(styleSource).toContain('overflow: hidden;')
  })

  test('collapse the page layout for narrower screens', () => {
    expect(styleSource).toContain('@media (max-width: 1024px)')
    expect(styleSource).toContain('.newton-controls')
    expect(styleSource).toContain('grid-template-columns: 1fr;')
  })

  test('mono font stack only references open-source fallbacks', () => {
    expect(styleSource).toContain("--mono: 'Fira Code', monospace;")
    expect(styleSource).not.toContain('SF Mono')
  })
})
