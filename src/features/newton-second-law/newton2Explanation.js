export function getNewton2Explanation({
  speed = 0,
  netForce = 0,
  appliedForce = 0,
  mass = 1,
  friction = 0,
}) {
  const speedMag = Math.abs(speed)
  const acceleration = Math.abs(netForce) > 0.001 ? netForce / mass : 0

  if (appliedForce > 0.1 && speedMag < 0.04 && Math.abs(netForce) < 0.1) {
    return `你正在施加 ${appliedForce.toFixed(1)}N 的力，但摩擦力抵消了它——合力为零，物体仍然静止。试试增大力量。`
  }

  if (appliedForce > 0.1 && Math.abs(acceleration) > 0.02 && speedMag > 0.04) {
    if (mass > 5) {
      return `你施加了 ${appliedForce.toFixed(1)}N 的力，但因为质量高达 ${mass.toFixed(1)}kg，加速度只有 ${acceleration.toFixed(2)}m/s²。物体越重，越难改变运动状态。`
    }
    return `你施加了 ${appliedForce.toFixed(1)}N 的力在 ${mass.toFixed(1)}kg 的物体上，产生 ${acceleration.toFixed(2)}m/s² 的加速度——F = ma 的直接体现。`
  }

  if (speedMag > 0.1 && appliedForce > 0.1 && Math.abs(netForce) < 0.1) {
    return `施加力等于摩擦力，合力为零，速度保持恒定。这就是力平衡状态。`
  }

  if (appliedForce <= 0.1 && speedMag > 0.1 && Math.abs(netForce) > 0.01) {
    return `外力已撤去，只剩摩擦力在减速。加速度方向与运动方向相反——力决定加速度的方向。`
  }

  if (speedMag < 0.04 && appliedForce <= 0.1) {
    return `小车静止。要让它运动，你需要施加力。力是改变运动状态的原因——这就是 F = ma 的起点。`
  }

  return `F = ma：力等于质量乘以加速度。调节左侧的力和质量滑块，观察加速度如何变化。`
}
