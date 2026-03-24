import { describe, expect, test } from 'vitest'
import {
  buildPrompt,
  getInputType,
  normalizeInput,
  parseWordAnalysis,
  validateInput,
} from '../src/lib/analysis.js'

describe('analysis helpers', () => {
  test('normalizes surrounding whitespace', () => {
    expect(normalizeInput('  Serendipity  ')).toBe('Serendipity')
  })

  test('detects English single-word input', () => {
    expect(getInputType('Serendipity')).toBe('english')
    expect(validateInput('Serendipity')).toEqual({ ok: true })
  })

  test('detects one to four Chinese characters', () => {
    expect(getInputType('知道')).toBe('chinese')
    expect(validateInput('知道')).toEqual({ ok: true })
    expect(validateInput('一二三四')).toEqual({ ok: true })
  })

  test('rejects five Chinese characters', () => {
    expect(validateInput('一二三四五')).toEqual({
      ok: false,
      message: '中文输入需为 1 到 4 个汉字',
    })
  })

  test('rejects English phrases', () => {
    expect(validateInput('fall apart')).toEqual({
      ok: false,
      message: '英文输入仅支持单个单词',
    })
  })

  test('rejects mixed-language input', () => {
    expect(validateInput('道word')).toEqual({
      ok: false,
      message: '请输入中文词或单个英文单词',
    })
  })

  test('builds Chinese prompt with character-analysis framing', () => {
    expect(buildPrompt('道', 'chinese')).toContain('原始画面')
  })

  test('builds English prompt with ljg-word framing', () => {
    expect(buildPrompt('Serendipity', 'english')).toContain('目标不是翻译')
  })

  test('parses JSON inside markdown fences', () => {
    const parsed = parseWordAnalysis(
      '```json\n{"word":"Serendipity","coreSymbolParts":["chance","attention","gift"],"coreSymbolResult":"discovery"}\n```',
      'Serendipity',
      'english',
    )

    expect(parsed.word).toBe('Serendipity')
    expect(parsed.inputType).toBe('english')
    expect(parsed.coreSymbolResult).toBe('discovery')
  })
})
