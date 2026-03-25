export function getVelocityArrowScale(speed) {
  const magnitude = Math.abs(speed)

  if (magnitude < 0.03) {
    return 0.45
  }

  return Math.max(0.45, Math.min(9.8, 0.52 + magnitude * 0.3 + Math.sqrt(magnitude) * 0.56))
}
