export function getNewtonExplanation({
  friction = 0,
  speed = 0,
  appliedForce = 0,
  netForce = 0,
}) {
  const speedMag = Math.abs(speed)

  if (appliedForce > 0.1 && speedMag < 0.04 && Math.abs(netForce) < 0.1) {
    return '你正在施加力，但摩擦力抵消了它——合力为零，所以物体仍然静止。牛顿第一定律说：没有合力，就没有运动状态的改变。'
  }

  if (appliedForce > 0.1 && speedMag > 0.04 && Math.abs(netForce) > 0.1) {
    return '力正在改变小车的运动状态。牛顿第一定律的核心：合外力是改变运动状态的原因，而不是维持运动状态的原因。'
  }

  if (friction <= 0.005 && speedMag > 0.1 && appliedForce <= 0.1) {
    return '小车几乎保持匀速前进！没有摩擦，就没有力在改变它的运动——这正是第一定律最想展示的：惯性。'
  }

  if (speedMag > 0.04 && appliedForce <= 0.1 && Math.abs(netForce) > 0.01) {
    return '你撤去了外力，现在只剩摩擦力在改变小车的速度。运动状态正在被改变——因为存在合力。'
  }

  if (speedMag < 0.04 && appliedForce <= 0.1) {
    return '小车停下来了，但不是"运动自己消失了"——是摩擦力在持续改变它的速度，直到减为零。'
  }

  return '调节力和摩擦，观察小车的运动状态如何变化。记住第一定律：没有合外力，运动状态不会改变。'
}
