import { describe, expect, test } from 'vitest'
import { getNewtonExplanation } from '../src/features/newton-first-law/newtonExplanation.js'

describe('newton explanation engine', () => {
  test('describes near-ideal inertial motion when friction is near zero and no force is applied', () => {
    const text = getNewtonExplanation({
      friction: 0,
      speed: 4.2,
      isPushing: false,
      hasPushed: false,
    })

    expect(text).toContain('匀速')
    expect(text).toContain('第一定律')
  })

  test('explains slowing down as friction rather than motion disappearing', () => {
    const text = getNewtonExplanation({
      friction: 0.12,
      speed: 1.6,
      isPushing: false,
      hasPushed: false,
    })

    expect(text).toContain('摩擦')
    expect(text).toContain('不是因为“运动自己会消失”')
  })

  test('explains an active push as a temporary external-force case', () => {
    const text = getNewtonExplanation({
      friction: 0.05,
      isPushing: true,
      hasPushed: true,
      speed: 3.5,
    })

    expect(text).toContain('外力')
    expect(text).toContain('短暂')
  })
})
