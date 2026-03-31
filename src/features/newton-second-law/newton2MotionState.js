export function getNewton2MotionStateLabel({
  speed = 0,
  netForce = 0,
  appliedForce = 0,
  mass = 1,
}) {
  const speedMag = Math.abs(speed)
  const netForceMag = Math.abs(netForce)
  const acceleration = netForce / mass

  if (speedMag < 0.04 && netForceMag <= 0.01 && appliedForce <= 0.01) {
    return '静止'
  }

  if (speedMag < 0.04 && appliedForce > 0 && netForceMag <= 0.05) {
    return '受力静止'
  }

  if (speedMag > 0.1 && netForceMag < 0.05) {
    if (appliedForce > 0.1) return '力平衡'
    return '匀速运动'
  }

  if (acceleration > 0.02 && (speedMag < 0.04 || Math.sign(speed) === Math.sign(netForce))) {
    return '加速中'
  }

  if (acceleration < -0.02 && speedMag > 0.04) {
    return '减速中'
  }

  return '运动观察'
}
