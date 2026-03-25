import { describe, expect, test } from 'vitest'
import { getNewtonMotionStateLabel } from '../src/features/newton-first-law/newtonMotionState.js'

describe('newton motion state label', () => {
  test('uses exact static wording when both speed and net force are zero', () => {
    const label = getNewtonMotionStateLabel({
      speed: 0,
      friction: 0.08,
      externalForce: 0,
      netForce: 0,
    })

    expect(label).toBe('静止')
  })

  test('keeps approximate static wording for tiny residual motion', () => {
    const label = getNewtonMotionStateLabel({
      speed: 0.02,
      friction: 0.08,
      externalForce: 0,
      netForce: -0.004,
    })

    expect(label).toBe('近似静止')
  })

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
