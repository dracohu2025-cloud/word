import { useMemo, useState } from 'react'
import { getNewton2Explanation } from './newton2Explanation.js'

const DEFAULT_CONTROLS = {
  appliedForce: 0,
  mass: 1,
  friction: 0.08,
}

export function useNewtonSecondSimulation() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [metrics, setMetrics] = useState({
    speed: 0,
    acceleration: 0,
    netForce: 0,
    appliedForce: 0,
    stateLabel: '静止',
  })
  const [runKey, setRunKey] = useState(0)

  const explanation = useMemo(
    () => getNewton2Explanation({
      speed: metrics.speed,
      netForce: metrics.netForce,
      appliedForce: metrics.appliedForce,
      mass: controls.mass,
      friction: controls.friction,
    }),
    [controls.friction, controls.mass, metrics.appliedForce, metrics.netForce, metrics.speed],
  )

  function updateControl(key, value) {
    setControls(current => ({ ...current, [key]: value }))
  }

  function resetSimulation() {
    setRunKey(key => key + 1)
    setMetrics({
      speed: 0,
      acceleration: 0,
      netForce: 0,
      appliedForce: 0,
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
