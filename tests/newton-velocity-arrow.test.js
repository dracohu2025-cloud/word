import { describe, expect, test } from 'vitest'
import { getVelocityArrowScale } from '../src/features/newton-first-law/newtonVelocityArrow.js'

describe('newton velocity arrow scaling', () => {
  test('keeps growing when higher speeds are reached after a push', () => {
    const fast = getVelocityArrowScale(6)
    const faster = getVelocityArrowScale(8)

    expect(faster).toBeGreaterThan(fast)
  })

  test('does not hit a tiny visual ceiling too early at very high speeds', () => {
    const medium = getVelocityArrowScale(8)
    const veryFast = getVelocityArrowScale(20)

    expect(veryFast).toBeGreaterThan(medium + 3)
    expect(veryFast).toBeGreaterThan(7)
  })

  test('still preserves a readable minimum size at low speed', () => {
    expect(getVelocityArrowScale(0.02)).toBeGreaterThanOrEqual(0.45)
  })
})
