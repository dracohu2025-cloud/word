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

  test('detects a single Chinese character', () => {
    expect(getInputType('道')).toBe('chinese')
    expect(validateInput('道')).toEqual({ ok: true })
  })

  test('rejects multiple Chinese characters', () => {
    expect(validateInput('知道')).toEqual({
      ok: false,
      message: '中文输入仅支持单个汉字',
    })
    expect(validateInput('一二三四')).toEqual({
      ok: false,
      message: '中文输入仅支持单个汉字',
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
      message: '请输入单个汉字或单个英文单词',
    })
  })

  test('builds Chinese prompt with character-analysis framing', () => {
    expect(buildPrompt('道', 'chinese')).toContain('原始画面')
  })

  test('builds English prompt with ljg-word framing', () => {
    expect(buildPrompt('Serendipity', 'english')).toContain('目标不是翻译')
    expect(buildPrompt('Serendipity', 'english')).toContain('每项尽量控制在 8 个汉字以内')
    expect(buildPrompt('Serendipity', 'english')).toContain('严格写 2 段')
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

  test('normalizes long live-model fields into card-friendly output', () => {
    const parsed = parseWordAnalysis(
      JSON.stringify({
        word: 'Serendipity',
        translation: '意外发现珍贵之物的本领与能力',
        originalImage: '波斯王子们在未知的路上，因为敏锐观察而意外发现更珍贵的旅程与线索，还因此得到额外启示。',
        coreSymbolParts: ['不期而遇的偏差线索', '敏锐洞察与观察能力', '开放心态和未预期价值'],
        coreSymbolResult: '偶然发现比原目标更重要的珍宝与价值',
        explanation: '第一段非常长非常长非常长非常长非常长非常长非常长非常长非常长非常长非常长。||第二段也非常长非常长非常长非常长非常长非常长非常长非常长非常长非常长非常长。||第三段不应该保留。',
        epiphanyEn: 'Serendipity is the art of finding something unexpectedly valuable while diligently searching for something entirely different in the first place.',
        epiphanyCn: '机缘巧合，是你在寻找一物时，因为仍然保持开放而意外发现更珍贵之物的能力与奖赏。',
      }),
      'Serendipity',
      'english',
    )

    expect(parsed.translation.length).toBeLessThanOrEqual(14)
    expect(parsed.originalImage.length).toBeLessThanOrEqual(40)
    expect(parsed.coreSymbolParts).toHaveLength(3)
    expect(parsed.coreSymbolParts.every(part => part.length <= 8)).toBe(true)
    expect(parsed.coreSymbolResult.length).toBeLessThanOrEqual(14)
    expect(parsed.explanation.split('||')).toHaveLength(2)
    expect(parsed.epiphanyEn.split(' ')).toHaveLength(18)
    expect(parsed.epiphanyCn.length).toBeLessThanOrEqual(28)
  })

  test('keeps explanation paragraphs on sentence boundaries when trimming', () => {
    const parsed = parseWordAnalysis(
      JSON.stringify({
        word: 'Incubate',
        explanation: '词源指向拉丁语“incubare”（卧于其上），描绘了以体温温暖和守护的原始画面。这不仅是物理孵化，更隐喻了任何需要时间、耐心与保护才能成长成形的事物。||第二段保持简短。',
      }),
      'Incubate',
      'english',
    )

    const [firstParagraph] = parsed.explanation.split('||').map(part => part.trim())
    expect(firstParagraph.endsWith('。') || firstParagraph.endsWith('…')).toBe(true)
    expect(firstParagraph).not.toMatch(/[，、,:：；;]$/)
  })
})
