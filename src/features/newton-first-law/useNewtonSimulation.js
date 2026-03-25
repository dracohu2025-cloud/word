import { useMemo, useState } from 'react'
import { getNewtonExplanation } from './newtonExplanation.js'

const DEFAULT_CONTROLS = {
  friction: 0.08,
  initialSpeed: 4,
}

export function useNewtonSimulation() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [metrics, setMetrics] = useState({
    speed: DEFAULT_CONTROLS.initialSpeed,
    netForce: 0,
    isPushing: false,
    hasPushed: false,
    stateLabel: '准备中',
  })
  const [runKey, setRunKey] = useState(0)
  const [pushKey, setPushKey] = useState(0)
  const [paused, setPaused] = useState(false)

  const explanation = useMemo(
    () => getNewtonExplanation({
      friction: controls.friction,
      speed: metrics.speed,
      isPushing: metrics.isPushing,
      hasPushed: metrics.hasPushed,
    }),
    [controls.friction, metrics.hasPushed, metrics.isPushing, metrics.speed],
  )

  function updateControl(key, value) {
    setControls(current => ({ ...current, [key]: value }))
  }

  function resetSimulation() {
    setRunKey(key => key + 1)
    setPaused(false)
    setMetrics({
      speed: controls.initialSpeed,
      netForce: 0,
      isPushing: false,
      hasPushed: false,
      stateLabel: '重新开始',
    })
  }

  function pushCart() {
    setPushKey(key => key + 1)
  }

  return {
    controls,
    metrics,
    explanation,
    paused,
    pushKey,
    runKey,
    pushCart,
    setPaused,
    setMetrics,
    updateControl,
    resetSimulation,
  }
}
