export function getVelocityArrowScale(speed) {
  const magnitude = Math.abs(speed)

  if (magnitude < 0.03) {
    return 0.45
  }

  return Math.max(0.45, Math.min(4.6, 0.42 + magnitude * 0.34 + Math.sqrt(magnitude) * 0.24))
}
