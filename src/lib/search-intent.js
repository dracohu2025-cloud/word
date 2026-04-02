export function createSearchIntentController(now = () => Date.now()) {
  let composing = false
  let pendingPointerSearch = false
  let pendingBlurSearch = false
  let suppressUntil = 0
  let recentCompositionUntil = 0

  return {
    startComposition() {
      composing = true
    },

    notePointerSearchIntent() {
      if (composing) {
        pendingPointerSearch = true
        return 'deferred'
      }

      return 'noop'
    },

    endComposition() {
      composing = false
      recentCompositionUntil = now() + 400

      if (!pendingPointerSearch && !pendingBlurSearch) {
        return 'noop'
      }

      pendingPointerSearch = false
      pendingBlurSearch = false
      suppressUntil = now() + 400
      return 'search'
    },

    noteBlur() {
      if (composing) {
        pendingBlurSearch = true
        return 'deferred'
      }

      if (now() < recentCompositionUntil) {
        suppressUntil = now() + 400
        recentCompositionUntil = 0
        return 'search'
      }

      return 'noop'
    },

    requestSearch() {
      if (now() < suppressUntil) {
        return 'noop'
      }

      if (composing) {
        pendingPointerSearch = true
        return 'deferred'
      }

      return 'search'
    },
  }
}
