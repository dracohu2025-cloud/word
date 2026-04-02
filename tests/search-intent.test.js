import { describe, expect, test } from 'vitest'
import { createSearchIntentController } from '../src/lib/search-intent.js'

describe('search intent controller', () => {
  test('searches immediately when not composing', () => {
    const controller = createSearchIntentController(() => 0)

    expect(controller.requestSearch()).toBe('search')
  })

  test('defers button-triggered search until composition ends', () => {
    let time = 0
    const controller = createSearchIntentController(() => time)

    controller.startComposition()
    expect(controller.notePointerSearchIntent()).toBe('deferred')

    time = 10
    expect(controller.endComposition()).toBe('search')
  })

  test('suppresses the follow-up click fired right after composition flush', () => {
    let time = 0
    const controller = createSearchIntentController(() => time)

    controller.startComposition()
    controller.notePointerSearchIntent()

    time = 10
    controller.endComposition()

    time = 20
    expect(controller.requestSearch()).toBe('noop')

    time = 500
    expect(controller.requestSearch()).toBe('search')
  })

  test('searches when composition-driven blur happens before the page receives click', () => {
    let time = 0
    const controller = createSearchIntentController(() => time)

    controller.startComposition()
    expect(controller.noteBlur()).toBe('deferred')

    time = 10
    expect(controller.endComposition()).toBe('search')
  })

  test('searches on blur right after composition end', () => {
    let time = 0
    const controller = createSearchIntentController(() => time)

    controller.startComposition()

    time = 10
    expect(controller.endComposition()).toBe('noop')

    time = 20
    expect(controller.noteBlur()).toBe('search')
  })
})
