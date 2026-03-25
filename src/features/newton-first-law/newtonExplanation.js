export function getNewtonExplanation({ friction = 0, forceMode = 'none', speed = 0 }) {
  const speedMagnitude = Math.abs(speed)

  if (forceMode === 'continuous') {
    return '现在系统受到持续外力推动，小车还在继续加速；这已经不再是第一定律最核心的“零合外力”情形。'
  }

  if (speedMagnitude < 0.04 && friction > 0) {
    return '小车停下来了，但这不是“运动自己消失”，而是摩擦一直在改变它的速度，最后把它减到了零。'
  }

  if (friction <= 0.005 && forceMode === 'pulse' && speedMagnitude > 0.1) {
    return '短推结束后，小车仍保持接近匀速前进；这正是第一定律最想强调的情形：没有额外外力时，原有运动状态会延续。'
  }

  if (friction <= 0.005 && forceMode === 'none' && speedMagnitude > 0.1) {
    return '现在小车几乎保持匀速前进，这最接近第一定律真正描述的状态：当合外力接近零时，物体会维持原有运动状态。'
  }

  return '现在小车正在减速，因为摩擦在持续改变它的速度；不是因为“运动自己会消失”。'
}
