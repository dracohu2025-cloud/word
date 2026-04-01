export function getNewton3CartLabel({ speed, netForce, appliedForce, phase, role }) {
  if (appliedForce < 0.1 && phase === 'idle') return '等待施力'

  if (phase === 'contact' && appliedForce > 0.1) {
    if (Math.abs(speed) < 0.01 && Math.abs(netForce) < 0.01) return '受力但未动'
    return role === 'A' ? '受推力后退' : '被推前进'
  }

  if (phase === 'separated') {
    if (Math.abs(speed) < 0.01) return '已停止'
    return '摩擦减速中'
  }

  if (phase === 'stopped') return '静止'

  return '等待施力'
}

export function getPhaseLabel(phase, appliedForce) {
  if (phase === 'idle' && appliedForce < 0.1) return '等待施力'
  if (phase === 'contact') return '接触中：力成对出现'
  if (phase === 'separated') return '已分离：各自减速'
  if (phase === 'stopped') return '双方静止'
  return '等待施力'
}
