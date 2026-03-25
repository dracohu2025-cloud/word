export function getNewtonMotionStateLabel({
  speed = 0,
  friction = 0,
  externalForce = 0,
  netForce = 0,
}) {
  const speedMagnitude = Math.abs(speed)
  const netForceMagnitude = Math.abs(netForce)

  if (speedMagnitude <= 0.0001 && netForceMagnitude <= 0.0001 && externalForce <= 0.0001) {
    return '静止'
  }

  if (speedMagnitude < 0.04) {
    return '近似静止'
  }

  if (externalForce > 0) {
    return '受到短推'
  }

  if (friction <= 0.0001 && netForceMagnitude <= 0.0001) {
    return '惯性运动'
  }

  if (friction <= 0.005 && netForceMagnitude <= 0.02) {
    return '接近惯性运动'
  }

  if (netForceMagnitude > 0.0001) {
    return '被摩擦减速'
  }

  return '匀速观察'
}
