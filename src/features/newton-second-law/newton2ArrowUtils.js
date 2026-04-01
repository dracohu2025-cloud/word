export function getVelocityArrowScale(speed) {
  const magnitude = Math.abs(speed)

  if (magnitude < 0.03) {
    return 0.35
  }

  return 0.35 + magnitude * 0.8
}

const MAX_FORCE = 20

export function getForceArrowScale(force) {
  if (force <= 0.1) {
    return 0.3
  }

  return Math.max(0.3, (force / MAX_FORCE) * 2.5)
}
