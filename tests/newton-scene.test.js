import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

const sceneSource = readFileSync(
  new URL('../src/features/newton-first-law/scene/NewtonScene.jsx', import.meta.url),
  'utf8',
)

describe('newton scene implementation', () => {
  test('does not use decorative Float transforms on the physics cart', () => {
    expect(sceneSource).not.toContain('Float')
  })

  test('does not restart the scene just because the initial-speed slider changed', () => {
    expect(sceneSource).not.toContain('}, [controls.initialSpeed, motionRef, onMetricsChange, runKey])')
  })

  test('lets the track material react to the friction control', () => {
    expect(sceneSource).toContain('controls.friction')
  })
})
