import { describe, expect, test } from 'vitest'
import { prepareExportNode } from '../src/lib/export.js'

function createMockNode(className = '') {
  return {
    className,
    style: {},
  }
}

describe('export helpers', () => {
  test('forces animated nodes into a visible static state before canvas capture', () => {
    const animated = createMockNode('card-header animate-in animate-delay-1')
    const delayed = createMockNode('card-body animate-delay-3')
    const plain = createMockNode('card-colophon')
    const root = {
      style: {},
      querySelectorAll(selector) {
        expect(selector).toBe('.animate-in, [class*="animate-delay-"]')
        return [animated, delayed]
      },
    }

    prepareExportNode(root)

    expect(animated.style.opacity).toBe('1')
    expect(animated.style.transform).toBe('none')
    expect(animated.style.animation).toBe('none')
    expect(delayed.style.opacity).toBe('1')
    expect(delayed.style.transform).toBe('none')
    expect(delayed.style.animation).toBe('none')
    expect(plain.style.opacity).toBeUndefined()
  })
})
