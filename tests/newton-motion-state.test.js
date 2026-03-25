import { describe, expect, test } from 'vitest'
import { getNewtonMotionStateLabel } from '../src/features/newton-first-law/newtonMotionState.js'

describe('newton motion state label', () => {
  test('uses exact inertial wording when friction and net force are both zero', () => {
    const label = getNewtonMotionStateLabel({
      speed: 8.4,
      friction: 0,
      externalForce: 0,
      netForce: 0,
    })

    expect(label).toBe('惯性运动')
  })

  test('keeps the approximate wording for near-ideal but not exact cases', () => {
    const label = getNewtonMotionStateLabel({
      speed: 3.2,
      friction: 0.003,
      externalForce: 0,
      netForce: -0.01,
    })

    expect(label).toBe('接近惯性运动')
  })
})
