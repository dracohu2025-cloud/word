import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

const mainEntry = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')

describe('app bootstrap', () => {
  test('does not wrap the WebGL app in React.StrictMode', () => {
    expect(mainEntry).not.toContain('<React.StrictMode>')
  })
})
