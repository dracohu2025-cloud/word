import { useMemo, useState } from 'react'
import { getNewton3Explanation } from './newton3Explanation.js'

const DEFAULT_CONTROLS = {
  mass: 2,
  appliedForce: 0,
}

const DEFAULT_METRICS = {
  speed: 0,
  acceleration: 0,
  appliedForce: 0,
  wallForce: 0,
  stateLabel: '等待施力',
  phase: 'idle',
}

export function useNewtonThirdSimulation() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [metrics, setMetrics] = useState(DEFAULT_METRICS)
  const [runKey, setRunKey] = useState(0)

  const explanation = useMemo(
    () => getNewton3Explanation({
      phase: metrics.phase,
      mass: controls.mass,
      appliedForce: metrics.appliedForce || controls.appliedForce,
      speed: metrics.speed,
      wallForce: metrics.wallForce,
    }),
    [controls.mass, controls.appliedForce, metrics.phase, metrics.speed, metrics.appliedForce, metrics.wallForce],
  )

  function updateControl(key, value) {
    setControls(current => ({ ...current, [key]: value }))
  }

  function resetSimulation() {
    setRunKey(key => key + 1)
    setMetrics({ ...DEFAULT_METRICS, stateLabel: '已重置' })
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
