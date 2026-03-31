export function getVelocityArrowScale(speed) {
  const magnitude = Math.abs(speed)

  if (magnitude < 0.03) {
    return 0.45
  }

  return Math.max(0.45, 0.52 + magnitude * 0.3 + Math.sqrt(magnitude) * 0.56)
}

const MAX_FORCE = 20

export function getForceArrowScale(force) {
  if (force <= 0.1) {
    return 0.3
  }

  return Math.max(0.3, (force / MAX_FORCE) * 2.5)
}
