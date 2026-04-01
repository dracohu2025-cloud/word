export function getVelocityArrowScale(speed) {
  const magnitude = Math.abs(speed)

  if (magnitude < 0.03) {
    return 0.35
  }

  return 0.35 + magnitude * 2.4
}
