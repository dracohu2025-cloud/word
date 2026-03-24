import { describe, expect, test } from 'vitest'
import { formatExplanationParagraphs, renderCardMarkup } from '../src/lib/render.js'

describe('render helpers', () => {
  test('formats explanation into paragraphs with bold markers', () => {
    const formatted = formatExplanationParagraphs('first **idea** || second paragraph')

    expect(formatted).toContain('<p>first <strong>idea</strong></p>')
    expect(formatted).toContain('<p>second paragraph</p>')
  })

  test('renders input type label and formula parts', () => {
    const markup = renderCardMarkup({
      word: 'Serendipity',
      inputType: 'english',
      phonetic: '/ˌserənˈdɪpəti/',
      translation: '机缘巧合',
      originalImage: 'A traveler unexpectedly finding a hidden path.',
      coreSymbolParts: ['chance', 'attention', 'gift'],
      coreSymbolResult: 'discovery',
      explanation: 'first paragraph || second paragraph',
      epiphanyEn: 'Meaning arrives to the one who notices.',
      epiphanyCn: '意义只降临给看见它的人。',
      mood: 'creative',
    })

    expect(markup).toContain('单词')
    expect(markup).toContain('formula-part-card')
    expect(markup).toContain('formula-result-card')
    expect(markup).toContain('chance')
    expect(markup).toContain('Meaning arrives to the one who notices.')
    expect(markup).toContain('深层解析')
  })

  test('renders chinese input as a single-character card label', () => {
    const markup = renderCardMarkup({
      word: '道',
      inputType: 'chinese',
      phonetic: 'dao',
      translation: '路径与法则',
      originalImage: '道路向前延伸。',
      coreSymbolParts: ['路径', '通达', '取向'],
      coreSymbolResult: '由行见理',
      explanation: 'first paragraph || second paragraph',
      epiphanyEn: 'The way appears in walking.',
      epiphanyCn: '路是在行走中显现的。',
      mood: 'contemplative',
    })

    expect(markup).toContain('汉字')
    expect(markup).not.toContain('中文词')
  })
})
