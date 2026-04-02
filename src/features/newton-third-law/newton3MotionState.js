export function getNewton3CartLabel({ speed, netForce, appliedForce, phase }) {
  if (appliedForce < 0.1 && phase === 'idle') return '等待施力'

  if (phase === 'contact' && appliedForce > 0.1) {
    return '推墙 · 力平衡'
  }

  if (appliedForce < 0.1 && Math.abs(speed) > 0.03) {
    return '摩擦减速中'
  }

  if (phase === 'idle' && appliedForce < 0.1) return '静止'

  return '静止'
}

export function getPhaseLabel(phase, appliedForce) {
  if (phase === 'idle' && appliedForce < 0.1) return '等待施力'
  if (phase === 'contact') return '推墙中：力成对出现'
  if (phase === 'idle' && appliedForce >= 0.1) return '小车接近墙面'
  return '等待施力'
}
