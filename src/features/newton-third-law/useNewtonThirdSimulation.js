import { useMemo, useState } from 'react'
import { getNewton3Explanation } from './newton3Explanation.js'

const DEFAULT_CONTROLS = {
  massA: 2,
  massB: 5,
  appliedForce: 0,
  friction: 0.05,
}

const DEFAULT_METRICS = {
  speedA: 0,
  speedB: 0,
  accelerationA: 0,
  accelerationB: 0,
  forceOnA: 0,
  forceOnB: 0,
  stateLabelA: '等待施力',
  stateLabelB: '等待施力',
  phase: 'idle',
}

export function useNewtonThirdSimulation() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [metrics, setMetrics] = useState(DEFAULT_METRICS)
  const [runKey, setRunKey] = useState(0)

  const explanation = useMemo(
    () => getNewton3Explanation({
      phase: metrics.phase,
      massA: controls.massA,
      massB: controls.massB,
      appliedForce: metrics.forceOnA !== 0 ? Math.abs(metrics.forceOnA) : controls.appliedForce,
      speedA: metrics.speedA,
      speedB: metrics.speedB,
      forceOnA: metrics.forceOnA,
      forceOnB: metrics.forceOnB,
    }),
    [
      controls.massA, controls.massB,
      metrics.phase, metrics.speedA, metrics.speedB,
      metrics.forceOnA, metrics.forceOnB,
    ],
  )

  function updateControl(key, value) {
    setControls(current => ({ ...current, [key]: value }))
  }

  function resetSimulation() {
    setRunKey(key => key + 1)
    setMetrics({ ...DEFAULT_METRICS, stateLabelA: '已重置', stateLabelB: '已重置' })
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
