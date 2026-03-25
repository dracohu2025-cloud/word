import { describe, expect, test } from 'vitest'
import { getNewtonExplanation } from '../src/features/newton-first-law/newtonExplanation.js'

describe('newton explanation engine', () => {
  test('describes near-ideal inertial motion when friction is near zero and no force is applied', () => {
    const text = getNewtonExplanation({
      friction: 0,
      forceMode: 'none',
      speed: 4.2,
    })

    expect(text).toContain('匀速')
    expect(text).toContain('第一定律')
  })

  test('explains slowing down as friction rather than motion disappearing', () => {
    const text = getNewtonExplanation({
      friction: 0.12,
      forceMode: 'none',
      speed: 1.6,
    })

    expect(text).toContain('摩擦')
    expect(text).toContain('不是因为“运动自己会消失”')
  })

  test('explains continuous pushing as a non-zero-net-force case', () => {
    const text = getNewtonExplanation({
      friction: 0.05,
      forceMode: 'continuous',
      speed: 3.5,
    })

    expect(text).toContain('持续外力')
    expect(text).toContain('不再是')
  })
})
