import { useMemo, useState } from 'react'
import { getNewtonExplanation } from './newtonExplanation.js'

const DEFAULT_CONTROLS = {
  appliedForce: 0,
  initialSpeed: 1,
  friction: 0,
}

export function useNewtonSimulation() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [metrics, setMetrics] = useState({
    speed: DEFAULT_CONTROLS.initialSpeed,
    netForce: 0,
    appliedForce: 0,
    stateLabel: '准备中',
  })
  const [runKey, setRunKey] = useState(0)

  const explanation = useMemo(
    () => getNewtonExplanation({
      friction: controls.friction,
      speed: metrics.speed,
      appliedForce: controls.appliedForce,
    }),
    [controls.friction, controls.appliedForce, metrics.speed, metrics.appliedForce],
  )

  function updateControl(key, value) {
    setControls(current => ({ ...current, [key]: value }))
  }

  function resetSimulation() {
    setRunKey(key => key + 11)
    setMetrics({
      speed: controls.initialSpeed,
      netForce: 0,
      appliedForce: controls.appliedForce,
      stateLabel: '已重置',
    })
  }

  return {
    controls,
    metrics,
    explanation,
    runKey,
    setMetrics,
    updateControl,
    resetSimulation,
  }
}
