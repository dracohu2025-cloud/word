export function getNewtonMotionStateLabel({
  speed = 0,
  friction = 0,
  externalForce = 0,
  netForce = 0,
}) {
  const speedMag = Math.abs(speed)
  const netForceMag = Math.abs(netForce)

  if (speedMag < 0.04 && netForceMag <= 0.01 && externalForce <= 0.01) {
    return '静止'
  }

  if (speedMag < 0.04 && externalForce > 0.01 && netForceMag <= 0.05) {
    return '受力静止'
  }

  if (externalForce > 0.01 && speedMag > 0.04 && Math.sign(netForce) === Math.sign(speed)) {
    return '加速中'
  }

  if (netForceMag > 0.01 && speedMag > 0.04 && Math.sign(netForce) !== Math.sign(speed)) {
    return '减速中'
  }

  if (friction <= 0.0001 && netForceMag <= 0.0001 && speedMag > 0.04) {
    return '惯性运动'
  }

  if (friction <= 0.005 && netForceMag <= 0.02 && speedMag > 0.04) {
    return '接近惯性运动'
  }

  if (speedMag > 0.04 && netForceMag < 0.05) {
    return '匀速运动'
  }

  return '运动观察'
}
