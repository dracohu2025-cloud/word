import { useMemo, useState } from 'react'
import { getNewtonExplanation } from './newtonExplanation.js'

const DEFAULT_CONTROLS = {
  friction: 0.08,
  initialSpeed: 4,
  forceMode: 'none',
  focusMode: 'speed-force',
}

export function useNewtonSimulation() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [metrics, setMetrics] = useState({
    speed: DEFAULT_CONTROLS.initialSpeed,
    netForce: 0,
    stateLabel: '准备中',
  })
  const [runKey, setRunKey] = useState(0)
  const [paused, setPaused] = useState(false)

  const explanation = useMemo(
    () => getNewtonExplanation({
      friction: controls.friction,
      forceMode: controls.forceMode,
      speed: metrics.speed,
    }),
    [controls.friction, controls.forceMode, metrics.speed],
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
      stateLabel: '重新开始',
    })
  }

  return {
    controls,
    metrics,
    explanation,
    paused,
    runKey,
    setPaused,
    setMetrics,
    updateControl,
    resetSimulation,
  }
}
