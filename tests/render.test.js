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
    expect(markup).toContain('chance')
    expect(markup).toContain('Meaning arrives to the one who notices.')
    expect(markup).toContain('深层解析')
  })
})
