import { describe, expect, test } from 'vitest'
import {
  getExportScale,
  normalizeExportBackgroundColor,
  prepareExportNode,
  shouldUsePreviewExport,
} from '../src/lib/export.js'

function createMockNode(className = '') {
  return {
    className,
    style: {},
  }
}

describe('export helpers', () => {
  test('uses preview-based saving for iOS Safari and WeChat browsers', () => {
    const iosSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    const wechat = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.54'
    const desktopChrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'

    expect(shouldUsePreviewExport(iosSafari)).toBe(true)
    expect(shouldUsePreviewExport(wechat)).toBe(true)
    expect(shouldUsePreviewExport(desktopChrome)).toBe(false)
  })

  test('caps export scale on constrained mobile webkit browsers to avoid huge canvases', () => {
    const iosSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

    expect(getExportScale({
      userAgent: iosSafari,
      devicePixelRatio: 3,
      width: 960,
      height: 1400,
    })).toBeLessThan(2)

    expect(getExportScale({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      devicePixelRatio: 2,
      width: 960,
      height: 1400,
    })).toBe(2)
  })

  test('falls back to a paper-like solid background when export background would be transparent', () => {
    expect(normalizeExportBackgroundColor('transparent')).toBe('#F5F2ED')
    expect(normalizeExportBackgroundColor('rgba(0, 0, 0, 0)')).toBe('#F5F2ED')
    expect(normalizeExportBackgroundColor('rgb(245, 242, 237)')).toBe('rgb(245, 242, 237)')
  })

  test('forces animated nodes into a visible static state before canvas capture', () => {
    const animated = createMockNode('card-header animate-in animate-delay-1')
    const delayed = createMockNode('card-body animate-delay-3')
    const glass = createMockNode('card-nav')
    const plain = createMockNode('card-colophon')
    const styles = new Map([
      [animated, { backgroundColor: 'transparent', backdropFilter: 'none', webkitBackdropFilter: 'none' }],
      [delayed, { backgroundColor: 'transparent', backdropFilter: 'none', webkitBackdropFilter: 'none' }],
      [glass, { backgroundColor: 'rgba(250, 250, 248, 0.82)', backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)' }],
      [plain, { backgroundColor: 'transparent', backdropFilter: 'none', webkitBackdropFilter: 'none' }],
    ])
    const root = {
      style: {},
      ownerDocument: {
        defaultView: {
          getComputedStyle(node) {
            if (node === root) {
              return { backgroundColor: 'transparent', backdropFilter: 'none', webkitBackdropFilter: 'none' }
            }

            return styles.get(node) || { backgroundColor: 'transparent', backdropFilter: 'none', webkitBackdropFilter: 'none' }
          },
        },
      },
      querySelectorAll(selector) {
        if (selector === '.animate-in, [class*="animate-delay-"]') {
          return [animated, delayed]
        }

        if (selector === '*') {
          return [animated, delayed, glass, plain]
        }

        throw new Error(`Unexpected selector: ${selector}`)
      },
    }

    animated.ownerDocument = root.ownerDocument
    delayed.ownerDocument = root.ownerDocument
    glass.ownerDocument = root.ownerDocument
    plain.ownerDocument = root.ownerDocument

    prepareExportNode(root)

    expect(root.style.backgroundColor).toBe('#F5F2ED')
    expect(animated.style.opacity).toBe('1')
    expect(animated.style.transform).toBe('none')
    expect(animated.style.animation).toBe('none')
    expect(delayed.style.opacity).toBe('1')
    expect(delayed.style.transform).toBe('none')
    expect(delayed.style.animation).toBe('none')
    expect(glass.style.backdropFilter).toBe('none')
    expect(glass.style.webkitBackdropFilter).toBe('none')
    expect(glass.style.backgroundColor).toBe('rgba(250, 250, 248, 0.82)')
    expect(plain.style.opacity).toBeUndefined()
  })
})
